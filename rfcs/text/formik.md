- Start Date: 2019-11-15


# Table of contents

- [Summary](#summary)
- [Motivation](#motivation)
- [Detailed design](#detailed-design)
  - [Overview of Carbon's form and validation functionality](#overview-of-carbons-form-and-validation-functionality)
  - [Overview of Formik](#overview-of-formik)
    - [Form validation using Formik](#form-validation-using-formik)
  - [Code examples](#code-examples)
    - [Checkbox and CheckboxGroup](#checkbox-and-checkboxgroup)
      - [HTML and React](#html-and-react)
      - [Checkbox usage with Formik](#checkbox-usage-with-formik)
      - [Form-level validation examples](#form-level-validation-examples)
      - [Simplification using `<Field>`](#simplification-using-field)
      - [Field-level validation example](#field-level-validation-example)
      - [CheckboxGroup example: uncontrolled](#checkboxgroup-example-uncontrolled)
      - [CheckboxGroup example: controlled](#checkboxgroup-example-controlled)
    - [Blocking navigation on unsaved changes](#blocking-navigation-on-unsaved-changes)
- [Drawbacks](#drawbacks)
  - [No support for non-blocking ("warning" or "info") validations](#no-support-for-non-blocking-warning-or-info-validations)
- [Alternatives](#alternatives)
- [Adoption strategy](#adoption-strategy)
- [How we teach this](#how-we-teach-this)
- [Unresolved questions](#unresolved-questions)


# Summary

Consider replacing Carbon's form and validation functionality with Formik 2.0.


<!-- # Basic example

If the proposal involves a new or changed API, include a basic code example.
Omit this section if it's not applicable. -->


# Motivation

React provides low-level support for HTML form elements (`<input>`, `<textarea>`, `<select>`, etc), but it doesn't
provide any built-in functionality for form validation, handling form submission, etc.  Therefore, Carbon currently
provides [`<Form>`](src/__experimental__/components/form/form.component.js) and
[`<FormField>`](src/__experimental__/components/form-field/form-field.component.js) experimental components and
[`withValidation`](src/components/validations/with-validation.hoc.js) HOC.

However, much of that functionality is also provided by existing third-party open-source libraries (such as
[React Form](https://github.com/tannerlinsley/react-form), [Formsy React](https://github.com/formsy/formsy-react),
[Informed](https://joepuzzo.github.io/informed), [Unform](https://github.com/Rocketseat/unform), etc).  React's
documentation on [fully-fledged form solutions](https://reactjs.org/docs/forms.html#fully-fledged-solutions) mentions:

> If you're looking for a complete solution including validation, keeping track of the visited fields, and handling
> form submission, [Formik](https://jaredpalmer.com/formik) is one of the popular choices.

The purpose of this RFC is to discuss the advantages and disadvantages of deprecating Carbon's existing form and
validation functionality and integrating [Formik](https://jaredpalmer.com/formik) as a replacement.

There's plenty of general discussion online about "reinventing the wheel" (see
[Stack Exchange](https://softwareengineering.stackexchange.com/questions/29513/is-reinventing-the-wheel-really-all-that-bad),
[Quora](https://www.quora.com/Why-is-it-discouraged-to-reinvent-the-wheel-in-programming-Wont-it-give-me-a-deeper-and-better-understanding-of-how-things-work-underneath),
[Jeff Atwood](https://blog.codinghorror.com/dont-reinvent-the-wheel-unless-you-plan-on-learning-more-about-wheels/),
etc).  Some of the key advantages of "not reinventing the wheel" (ie: not building a custom solution, but using an
existing third-party library) are:

* **Less code to maintain**  –  Much time and effort can be saved by using a third-party library which is kept
  well-maintained, thus freeing up one's development resources to focus on higher-priority project-unique functionality.
* **Robustness**  –  A popular well-maintained library is likely to be thoroughly tested and debugged, especially for
  edge cases which have been encountered and addressed by the library's community.
* **Familiarity**  –  Users are potentially already familiar with popular third-party libraries.

Considering the reasons why "reinventing the wheel" (ie: building a custom solution) can sometimes be beneficial in
certain situations:

* It can be a very educational experience for developers, but that isn't a relevant factor for this project.
* A third-party library may be an unnecessarily heavy solution, if only a small percentage of its functionality will be
  used by the application, and a custom-built solution may be much more lightweight.  But in this case, Formik is
  [a relatively small library](https://jaredpalmer.com/formik/docs/overview)
  ([14.7kB when minified and gzipped](https://bundlephobia.com/result?p=formik@2.0.4)), and we would be using a
  significant percentage of its functionality.


# Detailed design

## Overview of Carbon's form and validation functionality

Carbon provides the following components:

* [**`<Form>`**](src/__experimental__/components/form/form.component.js)  –  This augments an HTML
  [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) element with: a footer (containing "Save"
  and "Cancel" buttons), form submission functionality, [CSRF](https://en.wikipedia.org/wiki/CSRF) functionality, a
  [`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) "unsaved" warning, etc.
* [**`<FormField>`**](src/__experimental__/components/form-field/form-field.component.js)  –  This enables a
  [`<Label>`](src/__experimental__/components/label/label.component.js) and
  [`<FieldHelp>`](src/__experimental__/components/field-help/field-help.component.js) to be added to an individual
  form field.
* [**`withValidation`**](src/components/validations/with-validation.hoc.js)  –  This HOC wraps an individual form field,
  enabling validation functions (for errors, warnings and info) to be executed when the component blurs or receives
  updated props.


## Overview of Formik

> Formik keeps track of your form's state, and then exposes it (plus a few reusable methods and event handlers) to your
> form via props. [🔗](https://jaredpalmer.com/formik/docs/overview#the-gist)

Formik provides a small set of React components and hooks, of which the key ones are:

* [**`<Formik>`**](https://jaredpalmer.com/formik/docs/api/formik)  –  The central component of Formik, which wraps an
  HTML form, and accepts props such as
  [`initialValues`](https://jaredpalmer.com/formik/docs/api/formik#initialvalues-values),
  [`onSubmit()`](https://jaredpalmer.com/formik/docs/api/formik#onsubmit-values-values-formikbag-formikbag-void),
  [`validate()`](https://jaredpalmer.com/formik/docs/api/formik#validate-values-values-formikerrors-values-promise-any)
  and [`validationSchema()`](https://jaredpalmer.com/formik/docs/api/formik#validationschema-schema-schema).  It
  provides form state information (such as
  [`values`](https://jaredpalmer.com/formik/docs/api/formik#values-field-string-any),
  [`dirty`](https://jaredpalmer.com/formik/docs/api/formik#dirty-boolean),
  [`errors`](https://jaredpalmer.com/formik/docs/api/formik#errors-field-string-string) and
  [`isValid`](https://jaredpalmer.com/formik/docs/api/formik#isvalid-boolean)) and action methods (such as
  [`validateForm()`](https://jaredpalmer.com/formik/docs/api/formik#validateform-values-any-promise-formikerrors-values),
  [`validateField()`](https://jaredpalmer.com/formik/docs/api/formik#validatefield-field-string-void) and
  [`setValues()`](https://jaredpalmer.com/formik/docs/api/formik#setvalues-fields-field-string-any-void)).
* [**`<Form>`**](https://jaredpalmer.com/formik/docs/api/form),
  [**`<Field>`**](https://jaredpalmer.com/formik/docs/api/field),
  [**`<ErrorMessage>`**](https://jaredpalmer.com/formik/docs/api/errormessage)  –  Helper components (powered by
  [React Context](https://reactjs.org/docs/context.html)) which reduce boilerplate code.
* [**`useField()`**](https://jaredpalmer.com/formik/docs/api/useField)  –  A hook to help with building reusable input
  primitive components.

**Note:** Formik is only intended to be used with
[controlled components](https://reactjs.org/docs/forms.html#controlled-components), where the component's state is
controlled by supplying a `value` prop (or a `checked` prop for `radio` and `checkbox`).  Technically it's possible to
use Formik with [uncontrolled components](https://reactjs.org/docs/uncontrolled-components.html) (by not supplying a
controlling `value`/`checked` prop, and only supplying `name` `onChange` `onBlur` props), but this is strongly
discouraged :warning:


### Form validation using Formik

Formik supports three kinds of validation:

1. [**Form-level: plain**](https://jaredpalmer.com/formik/docs/guides/validation#validate)  –  A `values` object is
   passed to a `validate()` function which implements its own custom validation logic and returns an `errors` object.
2. [**Form-level: schema-based**](https://jaredpalmer.com/formik/docs/guides/validation#validationschema)  –  Performs
   validation using a [Yup](https://github.com/jquense/yup) schema.
3. [**Field-level**](https://jaredpalmer.com/formik/docs/guides/validation#field-level-validation)  –  Separate
   `validate()` functions are supplied for each form field.  This is the closest equivalent functionality of Carbon's
   [`withValidation`](src/components/validations/with-validation.hoc.js) HOC which attaches validation functions to an
   individual form field.

**Note:** Although Formik currently supports
[asynchronous validation](https://jaredpalmer.com/formik/docs/guides/validation), it's important to be aware that
there's [an RFC for removing this functionality from Formik](https://github.com/jaredpalmer/formik/issues/1524).

## Code examples

### Checkbox and CheckboxGroup

#### HTML and React

As a reminder of the requirements and behaviour of a
[native HTML checkbox element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox),
it must always have a [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname)
attribute (since this identifies the field within the form), but the
[`value`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value) attribute is optional, and
there can be multiple checkboxes with the same `name`:

```jsx
{/* When checked, this will submit `interest=on` */}
<input type="checkbox" name="interest" />
```

```jsx
{/* When checked, this will submit `interest=coding` */}
<input type="checkbox" name="interest" value="coding" />
```

```jsx
{/* If both are checked, this will submit `interest=coding&interest=music` */}
<input type="checkbox" name="interest" value="coding" />
<input type="checkbox" name="interest" value="music" />
```

To enable a checkbox to operate in controlled mode by React, the
[`checked`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#checked) boolean attribute is used
(**not** the `value` attribute, unlike most other React controlled components):

```jsx
<input type="checkbox" name="interest" value="coding" checked={isCodingChecked} />
<input type="checkbox" name="interest" value="music"  checked={isMusicChecked}  />
```

The [`onChange`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onchange)
and [`onBlur`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onblur) event handlers receive a
React [`SyntheticEvent`](https://reactjs.org/docs/events.html) object `e`, and the `name` `value` `checked` attributes
are available on `e.target`.


#### Checkbox usage with Formik

When a checkbox's `onChange` prop is connected to Formik's
[`handleChange`](https://jaredpalmer.com/formik/docs/api/formik#handlechange-e-reactchangeevent-any-void)
handler, it'll store the checkbox's state in Formik's
[`values`](https://jaredpalmer.com/formik/docs/api/formik#values-field-string-any) as an **array** of checked values
(regardless of whether there's one or multiple checkboxes with the same `name`).  For example, in uncontrolled mode
(strongly discouraged :warning:):

```jsx
{/* If unchecked, `values.interest` will be []         */}
{/* If checked,   `values.interest` will be ['coding'] */}
<input type="checkbox" name="interest" value="coding" onChange={handleChange} />
```

```jsx
{/* If neither is checked, `values.interest` will be []                  */}
{/* If the 1st is checked, `values.interest` will be ['coding']          */}
{/* If both are checked,   `values.interest` will be ['coding', 'music'] */}
<input type="checkbox" name="interest" value="coding" onChange={handleChange} />
<input type="checkbox" name="interest" value="music"  onChange={handleChange} />
```

To implement controlled mode, the `checked` prop must be set according to the `values.interest` array:

```jsx
<input type="checkbox"
       name="interest"
       value="coding"
       onChange={handleChange}
       checked={values.interest.includes('coding')} />
```


#### Form-level validation examples

Here's an example of validating a single checkbox with Formik, using a
[**form-level `validate` function**](https://jaredpalmer.com/formik/docs/api/formik#validate-values-values-formikerrors-values-promise-any)
and the [`<Formik>`](https://jaredpalmer.com/formik/docs/api/formik) and
[`<Form>`](https://jaredpalmer.com/formik/docs/api/form) components:

```js
function validate(values) {
  const errors = {};
  if (!values.interest.includes('coding')) {
    errors.interest = 'You must be interested in coding!';
  }
  return errors;
}
```

```jsx
<Formik initialValues={{ interest: [] }} validate={validate}>
  {({ values, errors, handleChange, handleBlur }) => (
    <Form>
      <input type="checkbox"
             name="interest"
             value="coding"
             onChange={handleChange}
             onBlur={handleBlur}
             checked={values.interest.includes('coding')} />
      {errors.interest}
    </Form>
  )}
</Formik>
```

or using **[`validationSchema`](https://jaredpalmer.com/formik/docs/api/formik#validationschema-schema-schema) with
[Yup](https://github.com/jquense/yup)**:

```js
const validationSchema = yup.object().shape({
  interest: yup.array().test(
    'coding-interest',
    'You must be interested in coding!',
    (value) => value.includes('coding')
  )
});
```

```jsx
<Formik initialValues={{ interest: [] }} validationSchema={validationSchema}>
  ...
```


#### Simplification using `<Field>`

To avoid having to manually wire up the `onChange` `onBlur` `checked` props to every checkbox instance, Formik's
[`<Field>`](https://jaredpalmer.com/formik/docs/api/field) component can be used:

```jsx
// Props `name` `value` are simply passed through from the <Field> component.
// Props `onChange` `onBlur` `checked` are injected automatically by Formik.
const MyCheckbox = ({ name, value, onChange, onBlur, checked }) => (
  <input type="checkbox"
         name={name}
         value={value}
         onChange={onChange}
         onBlur={onBlur}
         checked={checked} />
);

<Formik initialValues={{ interest: [] }} validate={validate}>
  {({ errors }) => (
    <Form>
      <Field as={MyCheckbox} type="checkbox" name="interest" value="coding" />
      {errors.interest}
    </Form>
  )}
</Formik>
```

Note: passing `type="checkbox"` to `<Field>` is required.  If it's omitted, then Formik won't supply the `checked` prop
to `<MyCheckbox>` (see [the docs](https://jaredpalmer.com/formik/docs/api/useField#fieldinputprops)).


#### Field-level validation example

Here's an example of validating a single checkbox, by passing a
[**field-level `validate` function**](https://jaredpalmer.com/formik/docs/api/field#validate) to Formik's `<Field>`
component, and using the `<MyCheckbox>` component defined above:

```js
function validate(interest) {
  let error;
  if (!interest.includes('coding')) {
    error = 'You must be interested in coding!';
  }
  return error;
}
```

```jsx
<Formik initialValues={{ interest: [] }}>
  {({ errors }) => (
    <Form>
      <Field as={MyCheckbox}
             type="checkbox"
             name="interest"
             value="coding"
             validate={validate} />
      {errors.interest}
    </Form>
  )}
</Formik>
```

This is very similar to Carbon's [`withValidation`](src/components/validations/with-validation.hoc.js) HOC, which
attaches validation functions to an individual form field.


#### CheckboxGroup example: uncontrolled

Using the `<MyCheckbox>` component defined above, here's an example of two CheckboxGroups, with validation being
performed at the CheckboxGroup level using
[`validate`](https://jaredpalmer.com/formik/docs/api/formik#validate-values-values-formikerrors-values-promise-any).  The
CheckboxGroup itself is "uncontrolled" (it's simply a `<div>`).

```js
function validate(values) {
  const errors = {};
  if (values.interest.length < 2) {
    errors.interest = 'You must select at least 2 interests';
  }
  const totalColours = values.red.length
                     + values.green.length
                     + values.blue.length;
  if (totalColours < 2) {
    errors.colours = 'You must select at least 2 colours';
  }
  return errors;
}
```

```jsx
<Formik
  initialValues={{ interest: [], red: [], green: [], blue: [], colours: null }}
  validate={validate}
>
  {({ errors }) => (
    <Form>
      <div id="checkboxgroup-interests">
        <Field as={MyCheckbox} type="checkbox" name="interest" value="coding" />
        <Field as={MyCheckbox} type="checkbox" name="interest" value="music" />
        <Field as={MyCheckbox} type="checkbox" name="interest" value="astronomy" />
        {errors.interest}
      </div>
      <div id="checkboxgroup-colours">
        <Field as={MyCheckbox} type="checkbox" name="red"   value="yes" />
        <Field as={MyCheckbox} type="checkbox" name="green" value="yes" />
        <Field as={MyCheckbox} type="checkbox" name="blue"  value="yes" />
        {errors.colours}
      </div>
    </Form>
  )}
</Formik>
```


#### CheckboxGroup example: controlled

Here's an example of a controlled CheckboxGroup:

* `<MyCheckboxGroup>` is controlled by a `value` prop, which contains an array of checked values.
* Unlike the previous example, `type="checkbox"` is **not** passed to the `<Field>`
  components, so Formik won't inject a controlling `checked` prop into `<MyCheckbox>` (see
  [the docs](https://jaredpalmer.com/formik/docs/api/useField#fieldinputprops)).  Instead, `<MyCheckbox>`
  receives its controlling `checked` prop from `<MyCheckboxGroup>` (see the usage of `React.Children.map`).

```js
function validate(values) {
  const errors = {};
  if (values.interest.length < 2) {
    errors.interest = 'You must select at least 2 interests';
  }
  return errors;
}
```

```jsx
const MyCheckboxGroup = ({ value, children }) => (
  <div>
    {React.Children.map(children, (child) => React.cloneElement(child, {
      checked: value.includes(child.props.value)
    }))}
  </div>
);

<Formik initialValues={{ interest: ['music'] }} validate={validate}>
  {({ values, errors }) => (
    <Form>
      <MyCheckboxGroup value={values.interest}>
        <Field as={MyCheckbox} name="interest" value="coding" />
        <Field as={MyCheckbox} name="interest" value="music" />
        <Field as={MyCheckbox} name="interest" value="astronomy" />
      </MyCheckboxGroup>
      {errors.interest}
    </Form>
  )}
</Formik>
```


### Blocking navigation on unsaved changes

[`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) fires a
[`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
event when the user is about to navigate away from the current page.  By calling
[`preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
on the event, an application can prompt the user for confirmation, allowing the user to cancel the navigation
action (eg: if the current page has unsaved changes, which would be lost if the user navigates away).

But [SPAs](https://en.wikipedia.org/wiki/Single-page_application) use the
[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) and
[`Location`](https://developer.mozilla.org/en-US/docs/Web/API/Location) Web APIs (often via the
[`history`](https://www.npmjs.com/package/history) NPM package) to perform client-side manipulation
of the browser's history and location (instead of loading new HTML pages from the server),
and so the `beforeunload` event is never fired.

The example below shows how to wire up Formik's [`dirty`](https://jaredpalmer.com/formik/docs/api/formik#dirty-boolean)
state to [React Router](https://reacttraining.com/react-router/) via
[`history.block()`](https://github.com/ReactTraining/history/blob/v4.10.1/docs/Blocking.md),
to prompt the user for confirmation before navigating away from
a dirty form (with unsaved changes) in a React Router based SPA:

```jsx
import React from 'react';
import { render } from 'react-dom';
import { createBrowserHistory } from 'history';
import { Router, Switch, Route, Link } from 'react-router-dom';
import { Formik, Form, Field, useFormikContext } from 'formik';

/** @see https://github.com/ReactTraining/react-router/blob/v5.1.2/packages/react-router/docs/api/Router.md */
/** @see https://github.com/ReactTraining/history/blob/v4.10.1/docs/GettingStarted.md */
const history = createBrowserHistory();

const initialValues = { firstName: 'Joe', lastName: 'Bloggs', email: 'joe.bloggs@example.com' };

function BlockNavigationIfDirty() {

  /** @see https://jaredpalmer.com/formik/docs/api/useFormikContext */
  /** @see https://jaredpalmer.com/formik/docs/api/formik#dirty-boolean */
  const { dirty } = useFormikContext();

  const isFormDirtyRef = React.useRef();

  isFormDirtyRef.current = dirty;

  React.useEffect(() => {

    /** @see https://github.com/ReactTraining/history/blob/v4.10.1/docs/Blocking.md */
    const unblockHistory = history.block(() => (
      isFormDirtyRef.current ?
      'Are you sure you want to leave this page? Unsaved changes will be lost!' :
      null
    ));

    const effectCleanup = unblockHistory;

    /** @see https://reactjs.org/docs/hooks-reference.html#cleaning-up-an-effect */
    return effectCleanup;

  }, []);

  return null;  // This functional component doesn't need to render anything.

}

const Home = () => (
  <Formik initialValues={initialValues} onSubmit={() => null}>
    <Form>
      <BlockNavigationIfDirty />
      <Field type='text' name='firstName' />
      <Field type='text' name='lastName' />
      <Field type='email' name='email' />
    </Form>
  </Formik>
);

const About = () => (
  <h2>About</h2>
);

const App = () => (
  <Router history={history}>
    <div>
      <ul>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/about'>About</Link></li>
      </ul>
      <Switch>
        <Route path='/about'><About /></Route>
        <Route path='/'><Home /></Route>
      </Switch>
    </div>
  </Router>
);

render(<App />, document.getElementById('root'));
```


# Drawbacks

Using Formik would require adding a new NPM dependency to Carbon, and [`formik`](https://www.npmjs.com/package/formik)
itself has 8 subdependencies.  Carbon is already using 4 of those subdependencies, so 4 additional subdependencies would be installed
([`deepmerge`](https://www.npmjs.com/package/deepmerge),
[`hoist-non-react-statics`](https://www.npmjs.com/package/hoist-non-react-statics),
[`scheduler`](https://www.npmjs.com/package/scheduler) and
[`tiny-warning`](https://www.npmjs.com/package/tiny-warning)).  If we wish to also install
[`yup`](https://www.npmjs.com/package/yup) for schema-based validation, this would add another 4 subdependencies
([`fn-name`](https://www.npmjs.com/package/fn-name),
[`property-expr`](https://www.npmjs.com/package/property-expr),
[`synchronous-promise`](https://www.npmjs.com/package/synchronous-promise) and
[`toposort`](https://www.npmjs.com/package/toposort)).

Some of the key disadvantages/risks of using a third-party library are:

* **Risk of abandonment**  –  It's very common for open-source projects to eventually be abandoned by their
  maintainers.  When this happens, any current or future bugs will never be fixed, and community-provided support (on
  GitHub, Stack Overflow, etc) will gradually decline.
* **Lack of customisability**  –  Every library has limits in how far its functionality can be customised via its public
  API.  We need to consider the future possibility that the Carbon project may want to provide new form-related
  functionality which Formik doesn't natively support, cannot be customised to support, and may never be able to
  support.


## No support for non-blocking ("warning" or "info") validations

Carbon's existing [`<Form>`](src/__experimental__/components/form/form.component.js) and
[`withValidation`](src/components/validations/with-validation.hoc.js) components support three categories of validation:
`error`, `warning` and `info`.  Form-submission will fail if any `error` validations fail (see
[here](https://github.com/Sage/carbon/blob/v9.1.1/src/components/validations/form-with-validations.hoc.js#L53)), but
`warning` and `info` validation failures do not block form-submission.

But Formik doesn't support any validation categories other than `error`.  The
[form-level `validate`](https://jaredpalmer.com/formik/docs/api/formik#validate-values-values-formikerrors-values-promise-any)
and [field-level `validate`](https://jaredpalmer.com/formik/docs/api/field#validate) functions are only allowed to
return an error message `string` (indicating validation failure) or `undefined` (indicating validation success) for each
form field.  When the form is submitted, Formik
[counts how many validation errors occurred](https://github.com/jaredpalmer/formik/blob/v2.0.6/src/Formik.tsx#L710), and
[blocks the form-submission if this count is non-zero](https://github.com/jaredpalmer/formik/blob/v2.0.6/src/Formik.tsx#L731).  This
functionality is hard-coded into Formik, with no public API available to customise this behaviour.

In 2018, [a feature request for non-blocking validations](https://github.com/jaredpalmer/formik/issues/389) was
submitted to Formik, but it has been closed.  [A PR was submitted](https://github.com/jaredpalmer/formik/pull/685),
but it was closed without being merged.  The author of Formik
[considered support for warnings for the release of v2](https://github.com/jaredpalmer/formik/issues/828#issue-350795228),
but in the end, this didn't happen.


# Alternatives

<!-- What other designs have been considered? What is the impact of not doing this? -->


# Adoption strategy

<!-- If we implement this proposal, how will existing Carbon developers adopt it? Is
this a breaking change? Can we write a codemod? Should we coordinate with
other projects or libraries? -->


# How we teach this

<!-- What names and terminology work best for these concepts and why? How is this
idea best presented? As a continuation of existing Carbon patterns?

Would the acceptance of this proposal mean the Carbon documentation must be
re-organized or altered? Does it change how Carbon is taught to new developers
at any level?

How should this feature be taught to existing Carbon developers? -->


# Unresolved questions

<!-- Optional, but suggested for first drafts. What parts of the design are still
TBD? -->

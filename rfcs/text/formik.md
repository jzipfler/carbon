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
- [Drawbacks](#drawbacks)
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
  and "Cancel" buttons), form submission functionality, [CRSF](https://en.wikipedia.org/wiki/CRSF) functionality, a
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


### Form validation using Formik

Formik supports three kinds of validation:

1. [**Form-level: plain**](https://jaredpalmer.com/formik/docs/guides/validation#validate)  –  A `values` object is
   passed to a `validate()` function which implements its own custom validation logic and returns an `errors` object.
2. [**Form-level: schema-based**](https://jaredpalmer.com/formik/docs/guides/validation#validationschema)  –  Performs
   validation using a [Yup](https://github.com/jquense/yup) schema.
3. [**Field-level**](https://jaredpalmer.com/formik/docs/guides/validation#field-level-validation)  –  Separate
   `validate()` functions are supplied for each form field.


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

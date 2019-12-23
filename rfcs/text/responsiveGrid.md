- Start Date: 2019-12-11

# Summary

A responsive grid system is a layout component that provides guidance on how components should be positioned within a user interface, adapting to screen size and orientation. We, the Carbon team, would like to implement the grid system designed by Sage UI designers.

# Basic example

http://designsystem.sage.com/product/invoice/

# Motivation

The grid layout is intended to solve a number of problems that are often experienced when developing complex web applications:
1. CSS floats are not well suited to application layout.
2. Layouts that use a combination of tables, JavaScript and floated elements are often brittle and can behave unexpectedly.
3. Fixed layouts that behave predictably cannot take advantage of the entire screen real estate.

A well designed grid layout will be:
1. Consistent, which helps users navigate and understand where information will be found.
2. Responsive, which gives users a predictable experience across multiple devices with different screen sizes.
3. Adaptable, enabling new design themes to be introduced more quickly as designs evolve over time.

# Detailed design

By dividing the available space into predictably-sized modules (both vertically and horizontally), complex layouts that don't have fixed dimensions can be controlled and components can be positioned allowing a clean separation of content and style. Once the underlying structure of a design is mapped, breakpoints can be used to control how each component responds at given widths.

For maximum flexibility, the Design System responsive grid uses 12 equal-width columns. 12 is divisible into 12, 6, 4, 3, 2 or 1 equal-width columns, giving maximum possible flexibility for a layout.

For full details of the proposal, read the [Sage Design System Grid](http://designsystem.sage.com/foundations/grid/).



To avoid introducing a breaking change, and to give developers the freedom to choose whether or not to use the component, a new `Grid` Component will be developed, that can be used at the same level as the `<AppWrapper />`, as a grid wrapper for components. 
The `<GridLayout />` will supply props to define breakpoints and number of columns, and will be styled using CSS Grid Layout.

Code example
```
  import AppWrapper from 'carbon-react/lib/components/app-wrapper';
  import { GridLayout, GridRow, GridColumn }  from 'carbon-react/lib/components/grid';
  
  const Index = () => (
  <AppWrapper>
    <GridLayout 
      breakpoints={[100, 200, 300, 400, 500]}
      columns={12}>
        <GridRow>
            <GridColumn>
              <MyComponent />
            </GridColumn>
            <GridColumn>
              <MyComponent /> 
            </GridColumn>
            <GridColumn>
              <MyComponent />
            </GridColumn>
        </GridRow>
      </GridLayout>
    </AppWrapper>
  );
```

## CSS Grid Layout
CSS Grid Layout is a truly two dimensional grid allowing us to specify dimensions of rows and columns and control where we position components within the grid.

Example
```
.parent {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr; /* Three columns, one three times as wide as the others */
  grid-template-rows: 200px auto 100px; /* Three rows, two with explicit widths */
  grid-template-areas:
    "header header header"
    ". main sidebar"
    "footer . .";
}

/*
  Now, we can explicitly place items in the defined rows and columns.
*/
.child-1 {
  grid-area: header;
}

.child-2 {
  grid-area: main;
}

.child-3 {
  grid-area: sidebar;
}

.child-4 {
  grid-area: footer;
}
```
# Drawbacks

When you consider that a grid layout is created to serve the same content on different view ports it comes with a few disadvantage:

1. Development time. It requires more work from the designer and developer than the equivalent single width design. Although this is true, familiarity will increase the turn around speed.
2. Page load speed. All the data is served to all view ports, regardless of how much real estate you have available and how much content is actually displayed.
3. Accessibility. Grid position of a component may be different to the DOM order causing flow and context discrepancies when using screen readers, and users who navigate with a keyboard may experience unexpected sequences when tabbing through components. The recommendation is that grid ordering and placement is used for only for visual, not logical, reordering of content. 

For an explanation of what this means in practice, see the [Mozilla CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/CSS_Grid_Layout_and_Accessibility#Visual_not_logical_re-ordering).


# Alternatives

## CSS Flexbox
Flexbox is designed for layout in one dimension (either a row or a column). Although it does support wrapping, the second-dimension positioning of components cannot be controlled (since the components are just being pushed along a single axis until they wrap).

Example:
```css
.parent {
  display: flex;
  flex-flow: row wrap; /* OK elements, go as far as you can on one line, then wrap as you see fit */
}
```
Overlapping modules within a Flexbox layout requires creative use of negative margins, transforms, and/or absolute positioning.

## CSS Framework (Bootstrap or Foundation)

[Bootstrap](https://getbootstrap.com/)  
[Foundation](https://foundation.zurb.com/)

Including a framework in Carbon, a library that is built with Styled Components at it's heart, would require generating a special `StyledComponent` at a global level to enable CSS resets and base stylesheets, which may cause conflicts with Carbon's Base Theme. There would be other disadvantages too:
1. Difficulty in overriding the framework code.
2. Bloated codebase that attempts to solve compatibility and support issues we don't need.
3. More complex markup.

Although a CSS framework would come with some advantages comprehensive documentation, community support and potentially quicker development speeds they have been rejected in favour of the CSS Grid.

# Adoption strategy

This is a new component and as such would not change the existing API, so it is not considered to be a breaking change. The new `<GridLayout />` can be used at a page level to wrap any group of components. See the detailed design above for a code example.

# How we teach this
Storybook and Fixtures testbed examples should be developed alongside the new component, demonstrating ways to implement the new layout.

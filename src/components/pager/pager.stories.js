import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { number, boolean, select } from '@storybook/addon-knobs';
import { State, Store } from '@sambego/storybook-state';
import { dlsThemeSelector, classicThemeSelector } from '../../../.storybook/theme-selectors';
import Pager from './pager.component';
import { Info, notes } from './documentation';
import OptionsHelper from '../../utils/helpers/options-helper/options-helper';
import getDocGenInfo from '../../utils/helpers/docgen-info';

Pager.__docgenInfo = getDocGenInfo(
  require('./docgenInfo.json'),
  /pager-navigation\.component(?!spec)/
);

const store = new Store({
  currentPage: '1',
  pageSize: Pager.defaultProps.pageSize
});

const handlePagination = (newPage, pageSize, type) => {
  if (type === 'size') {
    store.set({
      pageSize,
      currentPage: newPage
    });
  } else {
    store.set({ currentPage: newPage });
  }
};

const TableComponent = ({ propDefinitions }) => {
  // Custom TableComponent for displaying pageSizeSelectionOptions correctly
  // Can remove when no longer using Immutable
  const props = propDefinitions.map(
    ({
      property,
      propType,
      required,
      description,
      defaultValue
    }) => {
      const adjustedDefaultValue = (property === 'pageSizeSelectionOptions') ? '10, 25, 50' : defaultValue;

      return (
        <tr key={ property }>
          <td>{ property }</td>
          <td>{ propType.name }</td>
          <td>{ required ? 'yes' : '-' }</td>
          <td style={ { color: 'rgb(34, 34, 170)' } }>
            { adjustedDefaultValue || '-' }
          </td>
          <td>{ description }</td>
        </tr>
      );
    }
  );

  return (
    <table className='info-table'>
      <thead>
        <tr style={ { textAlign: 'left' } }>
          <th>property</th>
          <th>propType</th>
          <th>required</th>
          <th>default</th>
          <th>description</th>
        </tr>
      </thead>
      <tbody>{props}</tbody>
    </table>
  );
};

TableComponent.propTypes = {
  propDefinitions: PropTypes.array
};

function makeStory(name, themeSelector) {
  const component = () => {
    const totalRecords = number('totalRecords', 100);
    const pageSize = select('pageSize', OptionsHelper.pageSizes, Pager.defaultProps.pageSize);
    const showPageSizeSelection = boolean(
      'showPageSizeSelection',
      Pager.defaultProps.showPageSizeSelection
    );

    store.set({ pageSize });

    return (
      <State store={ store }>
        <Pager
          currentPage={ store.get('currentPage') }
          pageSize={ store.get('pageSize') }
          showPageSizeSelection={ showPageSizeSelection }
          totalRecords={ totalRecords }
          onPagination={ handlePagination }
        />
      </State>
    );
  };

  const metadata = {
    themeSelector,
    info: {
      propTables: [Pager],
      propTablesExclude: [State],
      TableComponent,
      text: Info
    },
    notes: { markdown: notes }
  };

  return [name, component, metadata];
}

storiesOf('Pager', module)
  .add(...makeStory('default', dlsThemeSelector))
  .add(...makeStory('classic', classicThemeSelector));

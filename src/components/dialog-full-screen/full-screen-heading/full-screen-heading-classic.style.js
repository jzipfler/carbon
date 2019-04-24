import { css } from 'styled-components';
import { THEMES } from '../../../style/themes';

export default ({ theme }) => theme.name === THEMES.classic && css`
  border-bottom-color: #CCD6DA;
`;
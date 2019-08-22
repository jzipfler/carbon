import styled, { css } from 'styled-components';
import CheckboxStyle from '../checkbox/checkbox.style';
import FieldHelpStyle from '../field-help/field-help.style';
import HiddenCheckableInputStyle from '../checkable-input/hidden-checkable-input.style';
import { StyledCheckableInput } from '../checkable-input/checkable-input.style';
import StyledCheckableInputSvgWrapper from '../checkable-input/checkable-input-svg-wrapper.style';
import ValidationIconStyle from '../../../components/validations/validation-icon.style';
import LabelStyle from '../label/label.style';
import ClassicRadioButtonStyles from './radio-button-classic.style';
import baseTheme from '../../../style/themes/base';

const validationBorderColor = ({
  theme,
  hasError,
  hasWarning,
  hasInfo,
  disabled
}) => {
  let color = theme.colors.border;

  if (disabled) {
    return null;
  }

  if (hasError) {
    color = theme.colors.error;
  } else if (hasWarning) {
    color = theme.colors.warning;
  } else if (hasInfo) {
    color = theme.colors.info;
  }

  return css`border-color: ${color};`;
};

const RadioButtonStyle = styled(CheckboxStyle)`
  ${({
    disabled,
    fieldHelpInline,
    reverse,
    size,
    theme
  }) => css`
    margin-bottom: 12px;

    ${FieldHelpStyle} {
      margin-left: 32px;
    }

    ${StyledCheckableInput} {
      margin-right: 16px;
    }

    ${StyledCheckableInputSvgWrapper} {
      padding: 0;
    }

    ${StyledCheckableInputSvgWrapper}, svg {
      border-radius: 50%;
    }

    ${StyledCheckableInput},
    ${HiddenCheckableInputStyle},
    ${StyledCheckableInputSvgWrapper},
    svg {
      height: 16px;
      width: 16px;
    }

    svg {
      padding: 1px;
    }

    ${StyledCheckableInputSvgWrapper} svg {
      ${validationBorderColor};
    }

    circle {
      r: 5;
    }

    ${HiddenCheckableInputStyle}:checked + ${StyledCheckableInputSvgWrapper} circle {
      fill: ${theme.colors.primary};
    }

    ${disabled && css`
      circle {
        fill: ${theme.disabled.input};
      }

      ${HiddenCheckableInputStyle}:checked + ${StyledCheckableInputSvgWrapper} circle {
        fill: ${theme.disabled.border};
      }
    `}

    ${(fieldHelpInline || reverse) && `
      ${FieldHelpStyle} {
        margin-left: 0;
        margin-right: 6px;
      }
    `}

    ${size === 'large' && css`
      ${LabelStyle} {
        padding: 4px 0;
      }

      ${StyledCheckableInput} {
        margin-right: 14px;
      }

      ${StyledCheckableInput},
      ${HiddenCheckableInputStyle},
      ${StyledCheckableInputSvgWrapper},
      svg {
        height: 24px;
        width: 24px;
      }

      circle {
        r: 3.75;
      }

      ${reverse && css`
        ${StyledCheckableInput} {
          margin-left: 6px;
        }

        ${!fieldHelpInline && `
          ${FieldHelpStyle} {
            padding: 0;
          }
        `}
      `}
    `}

    ${ClassicRadioButtonStyles}
  `}
`;

const validationIconColor = ({
  theme,
  hasError,
  hasWarning,
  hasInfo
}) => {
  if (!hasError && !hasWarning && !hasInfo) {
    return css`color: ${theme.help.color};`;
  }

  return null;
};

const StyledRadioButtonGroup = styled.div`
  & > ${LabelStyle} {
    cursor: default ;
    margin-bottom: 16px;
    padding: 0;
    display: flex;

    & ${ValidationIconStyle} {
      ${validationIconColor}
    }
  }
`;

StyledRadioButtonGroup.defaultProps = {
  theme: baseTheme
};

export { RadioButtonStyle, StyledRadioButtonGroup };
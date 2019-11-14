import React from 'react';
import { connect } from 'carbon-state-management/lib/flux';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import marked from 'marked';
import DocumentStore from './../../../stores/document';
import DocumentActions from './../../../actions/document';
import InformationStyles from '../../common/information-styles';
import Spinner from '../../../../src/__deprecated__/components/spinner';
import Row from 'components/row';
import Highlight from 'react-highlight';
import classNames from 'classnames';
import './document.scss';

class Document extends React.Component {
  state = { guide: '' }

  componentDidMount() {
    this.updateContent();
  }

  componentDidUpdate() {
    this.updateContent();
  }

  updateContent = () => {
    if (!this.getContent()) {
      DocumentActions.updateDocument(this.props.route.document);
    }
  }

  getContent = () => {
    return this.state.documentStore.get(this.props.route.document);
  }

  loadingClasses = () => {
    return classNames('demo-document__loading', {
      'demo-document__loading--hidden': this.getContent()
    });
  }

  render() {
    let content = this.getContent(),
        spinner = null;

    if (content) {
      content = (
        <div className='demo-document__content'>
          <Highlight innerHTML>
            { marked(content) }
          </Highlight>
        </div>
      );
    } else {
      spinner = <Row gutter='none'><Spinner columnAlign="center" size="small"
className="demo-document__spinner" /></Row>;
    }

    return (
      <InformationStyles>
        <div className='demo-document'>
          { content }

          <CSSTransitionGroup
            className={ this.loadingClasses() }
            component='div'
            transitionName='demo-document__loading'
            transitionAppear
            transitionAppearTimeout={ 300 }
            transitionEnterTimeout={ 300 }
            transitionLeaveTimeout={ 0 }
          >
            { spinner }
          </CSSTransitionGroup>
        </div>
      </InformationStyles>
    );
  }
}

export default connect(Document, DocumentStore);

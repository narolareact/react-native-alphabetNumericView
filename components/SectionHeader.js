import React from 'react';
import PropTypes from 'prop-types';
import ReactNative, { View, Text } from 'react-native';

export default class SectionHeader extends React.PureComponent {
  static propTypes = {
    /**
     * The id of the section
     */
    sectionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /**
     * A component to render for each section item
     */
    component: PropTypes.func,

    /**
     * A function used to propagate the root nodes handle back to the parent
     */
    updateTag: PropTypes.func
  };

  componentDidMount() {
    this.props.updateTag &&
      this.props.updateTag(ReactNative.findNodeHandle(this.refs.view), this.props.sectionId);
  }

  render() {
    const SectionComponent = this.props.component;
    const content = SectionComponent ? (
      <SectionComponent {...this.props} />
    ) : (
      <Text />
    );

    return <View ref="view">{content}</View>;
  }
}

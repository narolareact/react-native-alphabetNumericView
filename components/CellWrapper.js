import React from 'react';
import PropTypes from 'prop-types';
import ReactNative, { View } from 'react-native';

export default class CellWrapper extends React.PureComponent {
  static propTypes = {
    /**
     * The id of the section
     */
    sectionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /**
     * A component to render for each cell
     */
    component: PropTypes.func.isRequired,

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
    const Cell = this.props.component;
    return (
      <View ref="view">
        <Cell {...this.props} />
      </View>
    );
  }
}

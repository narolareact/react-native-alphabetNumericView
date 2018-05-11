import React from 'react';
import PropTypes from 'prop-types';
import ReactNative, { ListView, StyleSheet, View, NativeModules, Platform } from 'react-native';
import merge from 'merge';

import SectionHeader from './SectionHeader';
import SectionList from './SectionList';
// import CellWrapper from './CellWrapper';

const { UIManager } = NativeModules;

export default class SelectableSectionsListView extends React.PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (prev, next) => prev !== next
      }),
      offsetY: 0
    };

    this.renderSectionHeader = this.renderSectionHeader.bind(this);

    this.onScroll = this.onScroll.bind(this);
    this.onScrollAnimationEnd = this.onScrollAnimationEnd.bind(this);
    this.scrollToSection = this.scrollToSection.bind(this);

    // used for dynamic scrolling
    // always the first cell of a section keyed by section id
    this.cellTagMap = {};
    this.sectionTagMap = {};
    this.updateTagInCellMap = this.updateTagInCellMap.bind(this);
    this.updateTagInSectionMap = this.updateTagInSectionMap.bind(this);
  }

  componentWillMount() {
    if (this.props.renderHeader !== undefined && this.props.headerHeight === undefined) {
      throw new Error('You have to implement both renderHeader and headerHeight');
    }
    if (this.props.renderFooter !== undefined && this.props.footerHeight === undefined) {
      throw new Error('You have to implement both renderFooter and footerHeight');
    }
    this.calculateTotalHeight();
  }

  componentDidMount() {
    // push measuring into the next tick
    setTimeout(() => {
      UIManager.measure(ReactNative.findNodeHandle(this.refs.view), (x, y, w, h) => {
        this.containerHeight = h;
      });
    }, 0);
    // trick to implement contentOffset on Android
    if (this.props.contentOffset !== undefined && Platform.OS === 'android') {
      this.contentOffsetHandler = setTimeout(() => {
        this.refs.listview.scrollTo(this.props.contentOffset);
      }, 0);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data !== this.props.data) {
      this.calculateTotalHeight(nextProps.data);
    }
  }

  componentWillUnmount() {
    this.contentOffsetHandler && clearTimeout(this.contentOffsetHandler);
  }

  calculateTotalHeight(data) {
    data = data || this.props.data;

    if (Array.isArray(data)) {
      return;
    }

    this.sectionItemCount = {};
    this.totalHeight = Object.keys(data).reduce((carry, key) => {
      const itemCount = data[key].length;
      carry += itemCount * this.props.rowHeight;
      carry += this.props.sectionHeaderHeight;
      carry += this.props.footerHeight || 0;

      this.sectionItemCount[key] = itemCount;

      return carry;
    }, 0);
  }

  updateTagInSectionMap(tag, section) {
    this.sectionTagMap[section] = tag;
  }

  updateTagInCellMap(tag, section) {
    this.cellTagMap[section] = tag;
  }

  scrollToSection(section) {
    let y = 0;
    const headerHeight = this.props.headerHeight || 0;
    y += headerHeight;

    if (!this.props.useDynamicHeights) {
      const rowHeight = this.props.rowHeight;
      let sectionHeaderHeight = this.props.sectionHeaderHeight;
      let keys = Object.keys(this.props.data);
      if (typeof this.props.compareFunction === 'function') {
        keys = keys.sort(this.props.compareFunction);
      }
      const index = keys.indexOf(section);

      let numcells = 0;
      for (let i = 0; i < index; i++) {
        numcells += this.props.data[keys[i]].length;
      }

      sectionHeaderHeight *= index;
      y += numcells * rowHeight + sectionHeaderHeight;
      const maxY = this.totalHeight - (this.containerHeight + headerHeight);
      y = y > maxY ? maxY : y;

      this.refs.listview.scrollTo({ x: 0, y, animated: true });
    } else {
      UIManager.measureLayout(
        this.cellTagMap[section],
        ReactNative.findNodeHandle(this.refs.listview),
        () => {},
        (xx, yy, ww, hh) => {
          y = yy - this.props.sectionHeaderHeight;
          this.refs.listview.scrollTo({ x: 0, y, animated: true });
        }
      );
    }

    this.props.onScrollToSection && this.props.onScrollToSection(section);
  }

  renderSectionHeader(sectionData, sectionId) {
    const updateTag = this.props.useDynamicHeights ? this.updateTagInSectionMap : null;

    const title = this.props.getSectionTitle ? this.props.getSectionTitle(sectionId) : sectionId;

    return (
      <SectionHeader
        component={this.props.sectionHeader}
        title={title}
        sectionId={sectionId}
        sectionData={sectionData}
        updateTag={updateTag}
      />
    );
  }

  // renderRow(item, sectionId, index) {
  //   const RowComponent = this.props.renderRow;
  //   console.log(RowComponent);
  //   index = parseInt(index, 10);

  //   const isFirst = index === 0;
  //   const isLast = this.sectionItemCount[sectionId] - 1 === index;

  //   const props = {
  //     isFirst,
  //     isLast,
  //     sectionId,
  //     index,
  //     item,
  //     offsetY: this.state.offsetY,
  //     onSelect: this.props.onCellSelect
  //   };

  //   return <RowComponent {...props} {...this.props.rowProps} />;
  // }

  onScroll(e) {
    const offsetY = e.nativeEvent.contentOffset.y;
    if (this.props.updateScrollState) {
      this.setState({
        offsetY
      });
    }

    this.props.onScroll && this.props.onScroll(e);
  }

  onScrollAnimationEnd(e) {
    if (this.props.updateScrollState) {
      this.setState({
        offsetY: e.nativeEvent.contentOffset.y
      });
    }
  }

  render() {
    const { data } = this.props;
    const dataIsArray = Array.isArray(data);
    let sectionList;
    let renderSectionHeader;
    let dataSource;
    let sections = Object.keys(data);

    if (typeof this.props.compareFunction === 'function') {
      sections = sections.sort(this.props.compareFunction);
    }

    if (dataIsArray) {
      dataSource = this.state.dataSource.cloneWithRows(data);
    } else {
      sectionList = !this.props.hideSectionList ? (
        <SectionList
          style={this.props.sectionListStyle}
          textStyle={this.props.sectionListTextStyle}
          onSectionSelect={this.scrollToSection}
          sections={sections}
          data={data}
          getSectionListTitle={this.props.getSectionListTitle}
          component={this.props.sectionListItem}
        />
      ) : null;

      renderSectionHeader = this.props.renderSectionHeader
        ? this.props.renderSectionHeader
        : this.renderSectionHeader;
      dataSource = this.state.dataSource.cloneWithRowsAndSections(data, sections);
    }

    const props = merge({}, this.props, {
      onScroll: this.onScroll,
      onScrollAnimationEnd: this.onScrollAnimationEnd,
      dataSource,
      renderSectionHeader
    });

    props.style = void 0;

    return (
      <View ref="view" style={[styles.container, this.props.style]}>
        <ListView ref="listview" {...props} />
        {sectionList}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const stylesheetProp = PropTypes.oneOfType([PropTypes.number, PropTypes.object]);

SelectableSectionsListView.propTypes = {
  /**
   * The data to render in the listview
   */
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,

  /**
   * Whether to show the section listing or not
   */
  hideSectionList: PropTypes.bool,

  /**
   * Functions to provide a title for the section header and the section list
   * items. If not provided, the section ids will be used (the keys from the data object)
   */
  getSectionTitle: PropTypes.func,
  getSectionListTitle: PropTypes.func,

  /**
   * Function to sort sections. If not provided, the sections order will match data source
   */
  compareFunction: PropTypes.func,

  /**
   * Callback which should be called when the user scrolls to a section
   */
  onScrollToSection: PropTypes.func,

  /**
   * A custom element to render for each section list item
   */
  renderSelectionList: PropTypes.func,

  /**
   * A custom element to render for each section header
   */
  sectionHeader: PropTypes.func,

  /**
   * The height of the header element to render. Is required if a
   * header element is used, so the positions can be calculated correctly
   */
  headerHeight: PropTypes.number,

  /**
   * footer height
   */
  footerHeight: PropTypes.number,

  /**
   * An object to config contentOffset, work both Android/iOS
   */
  contentOffset: PropTypes.object,

  /**
   * The height of the section header component
   */
  sectionHeaderHeight: PropTypes.number.isRequired,

  /**
   * The height of the cell component
   */
  rowHeight: PropTypes.number.isRequired,

  /**
   * Whether to determine the y postion to scroll to by calculating header and
   * cell heights or by using the UIManager to measure the position of the
   * destination element. This is an exterimental feature
   */
  useDynamicHeights: PropTypes.bool,

  /**
   * Whether to set the current y offset as state and pass it to each
   * cell during re-rendering
   */
  updateScrollState: PropTypes.bool,

  /**
   * enableEmptySections ListView
   */
  enableEmptySections: PropTypes.bool,

  /**
   * Styles to pass to the container
   */
  style: stylesheetProp,

  /**
   * Styles to pass to the section list container
   */
  sectionListStyle: stylesheetProp,
  
  /**
   * Styles to pass to the section list container text
   */
  sectionListTextStyle: stylesheetProp,
};

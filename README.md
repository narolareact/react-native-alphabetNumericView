## Based on sunnylqm's [react-native-alphabetlistview](https://github.com/sunnylqm/react-native-alphabetlistview)
I just improve some api functions

You can find this component on npm:   
```
npm install --save react-native-atoz-listview

or

yarn add react-native-atoz-listview
```

# Demo

| Platform | Android | iOS |
|:--------:|:-------:|:---:|
| Demo gif link | [Android](https://media.giphy.com/media/l44Qfj4tTid5Gm3i8/source.gif) | [iOS](https://media.giphy.com/media/26BGFK79U8Rd7d5y8/source.gif) |

## Usage

```javascript
import React, { Component } from 'react';
import { TouchableHightLight, Text, View } from 'react-native';
import AtoZListView from 'react-native-atoz-listview';

const rowHeight = 40;

class MyScene extends Component {

  state = {
    data: {
      "A": [
        {
          "name": "Anh Tuan Nguyen",
          "age": 28
        },
        {
          "name": "An Nguyen",
          "age": 20
        },
      ],
      "Z": [
        {
          "name": "Zue Dang",
          "age": 22
        },
        {
          "name": "Zoom Jane",
          "age": 30
        },
      ]
    }
  }

  // Define your own renderRow
  renderRow = (item, sectionId, index) => {
    return (
      <TouchableHightLight 
        style={{ 
          height: rowHeight, 
          justifyContent: 'center', 
          alignItems: 'center'}}
      >
        <Text>{item.name}</Text>
      </TouchableHightLight>
    );
  }

  render() {
    // inside your render function
    return (
      <View style={{ flex: 1}}>
        <AtoZListView
          data={this.state.data}     // required array|object
          renderRow={this.renderRow} // required func
          rowHeight={rowHeight}      // required number
          sectionHeaderHeight={40}   // required number
          /**
          * Optional props: all props will passing to ListView
          * you simple look at ListView official document
          * headerHeight              number
          * footerHeigh               number
          * sectionListStyle          number|object
          * hideSectionList           bool
          * compareFunction           func
          * renderSelectionList       func
          * sectionListItem           func
          * contentOffset             object
          * style                     object|number
          */
        />
      </View>
    );
  }
}
```

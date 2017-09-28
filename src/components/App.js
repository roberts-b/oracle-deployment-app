import '../assets/css/App.css';
import React, { Component } from 'react';
const {ipcRenderer} = require('electron');



class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      ddl_value: ''
    }
  }
  componentDidMount() {
    this.result = 'no results';
    ipcRenderer.on('getDDL_reply_async', (event, arg) => {
      console.log(arg); // prints "pong"
      this.setState({ddl_value: arg});
    });
  }
  render() {
    return (
      <div>
        <div>
          <h1>DDL requesting page</h1>
          <p>Press request DDL to get DDL for statistics view</p>
          <button onClick={this.requestDDL}>Request DDL</button>
        </div>
        <div>
          <textarea value={this.state.ddl_value}/>
        </div>
      </div>
    );
  };

  requestDDL() {
    console.log('request DDL button clicked');
    // args['objectType'], args['objectName'], args['dbSchema']
    ipcRenderer.send('getDDL_async', {
      objectType: 'VIEW',
      objectName: 'TW_CLA_STATISTICS_AV',
      dbSchema: 'TIA'
    });
  };
}


export default App;

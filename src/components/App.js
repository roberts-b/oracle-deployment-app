import '../assets/css/App.css';
import 'semantic-ui-css/semantic.min.css';
import React, { Component } from 'react';
const {ipcRenderer} = require('electron');
import ConnectionComponent from './connection/connection-component.js';
import { Button, Container, Header, TextArea } from 'semantic-ui-react';


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
      <Container>
        <Container>
          <Header as='h1'>DDL requesting page</Header>
          <ConnectionComponent/>
          <p>Press request DDL to get DDL for statistics view</p>
          <Button onClick={this.requestDDL}>Request DDL</Button>
        </Container>
        <Container>
          <TextArea value={this.state.ddl_value}/>
        </Container>
      </Container>
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

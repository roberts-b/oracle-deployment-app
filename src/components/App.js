import '../assets/css/App.css';
import 'semantic-ui-css/semantic.min.css';
import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import ConnectionComponent from './connection/connection-component.js';
import { Button, Container, Header, TextArea, Segment } from 'semantic-ui-react';
import Constants from '../constants/constants.js';
import rpcNames from '../constants/rpc-names.js';
import ErrorSuccessModalComponent from './basic/error-success-modal.js';
import DbStructureComponent from './database_structure/db-structure-component.js';
const log = require('electron-log');


class App extends React.Component {

  dbStructureReference;

  constructor(props) {
    super(props);
    this.bindComponentListeners();
    this.state = {
      ddl_value: '',
      notificationsArray: [],
      isLoading: false
    }
  }
  componentDidMount() {
    this.registerIpcListeners();
  }

  render() {
    return (
      <Container fluid className='MainContainer'>
        <ErrorSuccessModalComponent
                notificationsArray={this.state.notificationsArray}
                closeHandler={this.closeHandlerFunc}
        />
        <Segment.Group horizontal compact className='mainSegments'>
          <Segment compact className='dbStructureSegment'>
            <DbStructureComponent 
            ref={(dbStructureReference)=>{this.dbStructureReference = dbStructureReference;}}
            addMessageToNotificationsArray={this.addMessageToNotificationsArray}
            />
          </Segment>
          <Segment className='MainWorkingAreaSegment'>
            <Segment.Group>
              <Segment>
                <Header as='h1'>DDL requesting page</Header>
                <ConnectionComponent 
                  addMessageToNotificationsArray={this.addMessageToNotificationsArray}
                  refreshDbStructureComponent = {this.refreshDbStructureComponent}
                  handleDbStructureItemSelection = {this.handleDbStructureItemSelection}
                   />
              </Segment>
              <Segment>
                <Header as='h1'>Press request DDL to get DDL for statistics view</Header>
                <Button loading={this.state.isLoading} disabled={this.state.isLoading} onClick={this.requestDDL}>Request DDL</Button>
              <Container>
                <TextArea value={this.state.ddl_value} />
              </Container>
            </Segment>
            </Segment.Group>
          </Segment>
        </Segment.Group>
      </Container>
    );
  };

  requestDDL() {
    log.info('request DDL button clicked');
    // args['objectType'], args['objectName'], args['dbSchema']
    ipcRenderer.send(rpcNames.GET_DDL.reqName, {
      objectType: 'VIEW',
      objectName: 'TW_CLA_STATISTICS_AV',
      dbSchema: 'TIA'
    });
    this.setState({ isLoading: true });
  };

  bindComponentListeners() {
    this.requestDDL = this.requestDDL.bind(this);
    this.closeHandlerFunc = this.closeHandlerFunc.bind(this);
    this.addMessageToNotificationsArray = this.addMessageToNotificationsArray.bind(this);
    this.refreshDbStructureComponent = this.refreshDbStructureComponent.bind(this);
  }

  closeHandlerFunc() {
    log.info('Close handler clicked!');
    this.setState({ notificationsArray: [] });
  }

  addMessageToNotificationsArray(message) {
    log.info('addMessageToNotificationsArray adding new error message: ', message);
    let notificationsArray = this.state.notificationsArray;
    notificationsArray.push(message);
    this.setState({ notificationsArray: notificationsArray });
  }

  handleDbStructureItemSelection(selectedItem){
    log.info('handleDbStructureItemSelection selected Item: ',selectedItem);
  }

  refreshDbStructureComponent(){
    this.dbStructureReference.getDatabaseObjectNames();
  }

  registerIpcListeners() {
    ipcRenderer.on(rpcNames.GET_DDL.respName, (event, arg) => {
      log.info(arg);
      if (arg.status === Constants.SUCCESS_MESSAGE) {
        this.setState({ ddl_value: arg.value, isLoading: false });
      } else if (arg.status === Constants.FAILURE_MESSAGE) {
        this.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
        this.setState({ isLoading: false });
      }
    });
  }

  componentWillUnmount() {
    log.info('Component will unmount called.');

    //we must deregister all IPCRenderer listeners here
    ipcRenderer.removeAllListeners([rpcNames.GET_DDL.respName]);
  }
}
export default App;

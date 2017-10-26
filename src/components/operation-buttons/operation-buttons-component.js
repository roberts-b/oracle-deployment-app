import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Container, Divider, Button } from 'semantic-ui-react';
import Constants from '../../constants/constants.js';
import PropTypes from 'prop-types';
import rpcNames from '../../constants/rpc-names.js';
var log = require('electron-log');

class OperationButtonsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.bindComponentListeners();
    }


    bindComponentListeners() {
        this.saveFile = this.saveFile.bind(this);
    }

    componentDidMount() {
        this.registerIpcListeners();

    }

    render() {
        
        return (
            <Container fluid>
                <Button color='green' icon='save' loading={this.props.isLoading} disabled={this.props.isDisabled} onClick={this.saveFile}/>
                <Button icon='refresh' loading={this.props.isLoading} disabled={this.props.isDisabled} onClick={this.props.getObjectStructure}/>
                <Divider />
            </Container>
        )
    }

    registerIpcListeners() {
        ipcRenderer.on(rpcNames.SAVE_FILE.respName, (event, arg) => {
            // log.info(arg);
            if (arg.status === Constants.SUCCESS_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: true, text: arg.value });
            } else if (arg.status === Constants.FAILURE_MESSAGE) {
                this.props.addMessageToNotificationsArray({ isPositive: false, text: arg.value });
            }
        });
    }

    saveFile(){
        ipcRenderer.send(rpcNames.SAVE_FILE.reqName, {content: this.props.contentToSave, fileName: this.props.fileName});
    }
}

OperationButtonsComponent.PropTypes = {
    isLoading: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    getObjectStructure: PropTypes.func.isRequired,
    addMessageToNotificationsArray: PropTypes.func.isRequired,
    contentToSave: PropTypes.string,
    fileName: PropTypes.string
}


export default OperationButtonsComponent;
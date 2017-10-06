import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Segment, Header, Dropdown, Form } from 'semantic-ui-react';
import ErrorSuccessModalComponent from '../basic/error-success-modal.js';
import Constants from '../../constants/constants.js';


class ConnectionComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();
        this.state = {
            currentTnsname: '',
            allTnsNames: [],
            notificationsArray: [],
            credentials: { userName: '', password: '' }
        }
    }

    componentDidMount() {
        this.getAllTnsNames();
        this.getCurrentTnsName();
    }

    isNotificationsPresent() {
        return;
    }

    addMessageToNotificationsArray(newObject) {
        console.log('addMessageToNotificationsArray adding new error message: ', newObject);
        this.state.notificationsArray.push(newObject);
    }

    render() {


        return (
            <Segment.Group
                horizontal

            >
                <Segment inverted color='grey'>
                    <ErrorSuccessModalComponent
                        notificationsArray={this.state.notificationsArray}
                        closeHandler={this.closeHandlerFunc}
                    />

                    <Dropdown
                        placeholder='Select connection ...'
                        options={this.state.allTnsNames}
                        value={this.state.currentTnsname}
                        onChange={this.handleInputChange}
                        button
                        name='tnsDropDown'
                    />
                </Segment>
                <Segment inverted color='grey'>
                    <Form onSubmit={this.handleCredentialsSubmit}>
                        <Form.Group>
                            <Form.Input placeholder='User Name' name='userName' value={this.state.credentials.userName} onChange={this.handleInputChange} />
                            <Form.Input type='password' placeholder='Password' name='password' value={this.state.credentials.password} onChange={this.handleInputChange} />
                            <Form.Button content='Save' />
                        </Form.Group>
                    </Form>
                </Segment>
            </Segment.Group>
        );
    }

    handleInputChange(event, data) {
        const targetName = data.name;

        let newValue = data['value'];

        if (targetName === 'tnsDropDown') {
            if(newValue === this.state.currentTnsname){
                //skip if selected same value
                return;
            }
            //save also new value to preferences
            let result = ipcRenderer.sendSync('set_current_tns_sync', newValue);

            this.setState({ currentTnsname: newValue });
            let isSuccess = Constants.SUCCESS_MESSAGE === result;
            this.addMessageToNotificationsArray({ isPositive: isSuccess, text: isSuccess ? 'Successfully updated preferences to use ' + newValue : 'Failed to update preferences to use ' + newValue });
        } else if(targetName === 'userName' || targetName === 'password') {
            this.setCredentialValueToState(newValue, targetName);
        }
    }

    closeHandlerFunc() {
        console.log('Close handler clicked!');
        this.setState({ notificationsArray: [] });
    }

    setCredentialValueToState(newValue, parameterNameToSet) {
        let credentials = this.state.credentials;
        if (parameterNameToSet === 'userName') {
            credentials.userName = newValue;
        } else if (parameterNameToSet === 'password') {
            credentials.password = newValue;
        }
        this.setState({ credentials: credentials });
    }

    handleCredentialsSubmit() {
        console.log('handleCredentialsSubmit new username: ' + this.state.credentials.userName + ' new password: ' + this.state.credentials.password);
    }

    getAllTnsNames() {
        ipcRenderer.send('get_all_tns_async');
        console.log('getOptions sent');
        ipcRenderer.on('get_all_tns_reply_async', (event, arg) => {
            let resultArray = [];
            for (let value of arg) {
                resultArray.push({
                    value: value,
                    text: value
                });
            }
            console.log('getAllTnsNames result array: ', resultArray);
            this.setState({ allTnsNames: resultArray });
        });
    };

    getCurrentTnsName() {
        const currentTnsName = ipcRenderer.sendSync('get_current_tns_sync');
        console.log('getCurrentTnsName result: ', currentTnsName);
        this.setState({ currentTnsname: currentTnsName });
    }

    bindComponentListeners() {
        this.handleInputChange = this.handleInputChange.bind(this);
        this.closeHandlerFunc = this.closeHandlerFunc.bind(this);
        this.handleCredentialsSubmit = this.handleCredentialsSubmit.bind(this);
    }
}

export default ConnectionComponent;
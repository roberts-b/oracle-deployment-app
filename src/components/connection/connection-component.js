import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Segment, Header, Dropdown, Form } from 'semantic-ui-react';
import Constants from '../../constants/constants.js';
import PropTypes from 'prop-types';

class ConnectionComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();
        this.state = {
            currentTnsname: '',
            allTnsNames: [],
            
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

    

    render() {


        return (
            <Segment.Group horizontal>
                <Segment inverted color='grey'>
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

            this.setCurrentUserNamePassword(newValue);

            let isSuccess = Constants.SUCCESS_MESSAGE === result.status;
            this.props.addMessageToNotificationsArray({ isPositive: isSuccess, text: isSuccess ? 'Successfully updated preferences to use ' + newValue : 'Failed to update preferences to use ' + newValue });
        } else if(targetName === 'userName' || targetName === 'password') {
            this.setCredentialValueToState(newValue, targetName);
        }
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

        //must use once because we need responce only one time, this way we don't have to deregister this listeren
        ipcRenderer.once('get_all_tns_reply_async', (event, arg) => {
            if(arg.status === Constants.FAILURE_MESSAGE){
                this.props.addMessageToNotificationsArray({ isPositive: false, text: 'Failed to get all TNS names !!' });
                return;
            }
            let resultArray = [];
            for (let value of arg.value) {
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
        if(currentTnsName.status === Constants.FAILURE_MESSAGE){
            this.props.addMessageToNotificationsArray({ isPositive: false, text: 'Failed to load current TNS name !!!' });
            return;
        }
        console.log('getCurrentTnsName result: ', currentTnsName.value);
        this.setState({ currentTnsname: currentTnsName.value});
        this.setCurrentUserNamePassword(currentTnsName.value);
    }

    bindComponentListeners() {
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCredentialsSubmit = this.handleCredentialsSubmit.bind(this);
    }

    setCurrentUserNamePassword(tnsName){
        const result = ipcRenderer.sendSync('get_username_password_by_tns_name_sync',tnsName);
        console.log('setCurrentUserNamePassword initialValue = ', result);
        if(result.status === Constants.FAILURE_MESSAGE){
            this.props.addMessageToNotificationsArray({ isPositive: false, text: 'Failed to load current username and password for tnsName: '+tnsName });
            return;
        }
        const usernamePasswordObject = result.value;
        console.log('setCurrentUserNamePassword result: ', usernamePasswordObject);
        this.setState({ credentials: usernamePasswordObject});
    }
}


ConnectionComponent.PropTypes = {
    addMessageToNotificationsArray: PropTypes.func.isRequired,
}


export default ConnectionComponent;
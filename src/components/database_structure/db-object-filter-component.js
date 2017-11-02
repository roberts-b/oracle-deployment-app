import React, { Component } from 'react';
const { ipcRenderer } = require('electron');
import { Modal, Button, Input, Checkbox, Label, Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';
const log = require('electron-log');
import rpcNames from '../../constants/rpc-names.js';
import Constants from '../../constants/constants.js';

class DbStructureFilterComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();

        this.state = {
            isOpen: false,
            filterExpression: '',
            isNot: false,
            objectName: ''

        }
    }

    bindComponentListeners() {
        this.closeHandler = this.closeHandler.bind(this);
        this.openFilterComponent = this.openFilterComponent.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.saveFilterHandler = this.saveFilterHandler.bind(this);

    }

    render() {
        return (
            <Modal
                size='small'
                className='dbStructureFilterModalComponent'
                dimmer={true}
                open={this.state.isOpen}
                onClose={this.closeHandler}>
                <Modal.Header content={'Filter for ' + this.state.objectName} />
                <Modal.Content>
                    <Segment>
                        <Checkbox name='isNotCheckbox' label=' Not' checked={this.state.isNot} onChange={this.handleInputChange} />
                        <Input name='filterExpressionInput' label='Expression' placeholder='Filter expression...' value={this.state.filterExpression} onChange={this.handleInputChange} />
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive icon='checkmark' content='Ok' onClick={this.saveFilterHandler} />
                    <Button negative content='Cancel' onClick={this.closeHandler} />
                </Modal.Actions>

            </Modal>
        );
    }

    closeHandler() {
        this.setState({ isOpen: false });
    }

    openFilterComponent(objectName) {
        //get current filter values from settings for this objectname
        let result = ipcRenderer.sendSync(rpcNames.GET_OBJECT_FILTER_PARAMETERS.reqName, objectName);
        // console.log('openFilterComponent GET_OBJECT_FILTER_PARAMETERS returned: ', result);
        //{objectName: objectName, expression: expression, isNot: isNot}
        if(Constants.SUCCESS_MESSAGE === result.status){
            this.setState({ isOpen: true, objectName: objectName, filterExpression: result.result.expression, isNot: result.result.isNot});
        }else if(Constants.FAILURE_MESSAGE === result.status){
            this.props.addMessageToNotificationsArray({ isPositive: false, text: result.message });
        }
        
    }

    saveFilterHandler() {
        
        let result = ipcRenderer.sendSync(rpcNames.SAVE_OBJECT_FILTER_PARAMETERS.reqName, 
            {objectName: this.state.objectName, expression: this.state.filterExpression, isNot: this.state.isNot});

        
        if(Constants.SUCCESS_MESSAGE === result.status){
            this.props.onFilterUpdated(this.state.objectName);
        }else if(Constants.FAILURE_MESSAGE === result.status){
            this.props.addMessageToNotificationsArray({ isPositive: false, text: result.message });
        }

        this.closeHandler();
    }

    handleInputChange(event, data) {
        const targetName = data.name;

        if (targetName === 'filterExpressionInput') {
            let newValue = data['value'];
            this.setState({ filterExpression: newValue });
        } else if (targetName === 'isNotCheckbox') {
            let newValue = data['checked'];
            this.setState({ isNot: newValue });
        }
    }

}

DbStructureFilterComponent.PropTypes = {
    onFilterUpdated: PropTypes.func.isRequired,
    addMessageToNotificationsArray: PropTypes.func.isRequired,

}

export default DbStructureFilterComponent;
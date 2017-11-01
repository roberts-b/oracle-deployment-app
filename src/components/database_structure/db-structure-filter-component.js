import React, { Component } from 'react';
import { Modal, Button, Input, Checkbox, Label, Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';
const log = require('electron-log');

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
                dimmer={true}
                open={this.state.isOpen}
                onClose={this.closeHandler}>
                <Modal.Header content={'Filter for ' + this.state.objectName} />
                <Modal.Content>
                    <Segment>
                        <Checkbox name='isNotCheckbox' toggle label=' Not' checked={this.state.isNot} onChange={this.handleInputChange} />
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
        this.setState({ isOpen: true, objectName: objectName });
    }

    saveFilterHandler() {

        //TODO: most probably this should be called after callback from function which updates settings and sets filters
        //so database structure component then reexecutes its query
        this.props.onFilterUpdated(this.state.objectName);
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
    objectName: PropTypes.string.isRequired,
    onFilterUpdated: PropTypes.func.isRequired

}

export default DbStructureFilterComponent;
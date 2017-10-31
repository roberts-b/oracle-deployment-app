import React, { Component } from 'react';
import { Modal, Button, Input, Checkbox } from 'semantic-ui-react';
import PropTypes from 'prop-types';
const log = require('electron-log');

class DbStructureFilterComponent extends React.Component {

    constructor(props) {
        super(props);
        this.bindComponentListeners();

        this.state = {
            isOpen: false,
            
        }
    }

    render() {
        return (
            <Modal
                size='small'
                dimmer={true}
                open={this.state.isOpen}
                onClose={this.closeHandler}>
                <Modal.Content>
                    <Input value placeholder='Filter expression...' value={this.props.filterExpression} />
                    <Checkbox label=' Not' checked={this.props.isNot} />
                </Modal.Content>
                <Modal.Actions>
                    <Button positive icon='checkmark' content='Ok'/>
                    <Button negative  content='Cancel' onClick={this.props.closeHandler} />
                </Modal.Actions>

            </Modal>
        );
    }

    closeHandler(){
        this.setState({isOpen: false});
    }

}

ErrorSuccessModalComponent.PropTypes = {
    notificationsArray: PropTypes.array.isRequired,
    filterExpression: PropTypes.string,
    isNot: PropTypes.bool
}

export default DbStructureFilterComponent;
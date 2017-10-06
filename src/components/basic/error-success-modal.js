import React, { Component } from 'react';
import { Message, Modal, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

class ErrorSuccessModalComponent extends React.Component {

    render() {
        return (
            <Modal
                dimmer='blurring'
                open={this.props.notificationsArray.length > 0}
                onClose={this.props.closeHandler}
            >
                <Modal.Content>
                    {this.props.notificationsArray.map((value, i) => {
                        console.log(value);
                        return <Message key={i} negative={!value.isPositive} positive={value.isPositive}>
                            <Message.Header key={i}>{value.isPositive ? 'SUCCESS' : 'ERROR'}</Message.Header>
                            <p>{value.text}</p>
                        </Message>
                    })}
                </Modal.Content>
                <Modal.Actions>
                    <Button content='Close' onClick={this.props.closeHandler} />
                </Modal.Actions>

            </Modal>
        );
    }
}

ErrorSuccessModalComponent.PropTypes = {
    closeHandler: PropTypes.func.isRequired,
    notificationsArray: PropTypes.array.isRequired
}

export default ErrorSuccessModalComponent;
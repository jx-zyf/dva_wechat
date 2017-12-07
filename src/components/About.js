import React, { Component } from 'react';
import MainLayout from '../layout';

class About extends Component {
    render() {
        return (
            <MainLayout defaultSelectedKeys={['2']}>
                about
            </MainLayout>
        );
    }
}

export default About;
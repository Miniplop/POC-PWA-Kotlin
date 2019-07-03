import React, { Component } from 'react';
import './App.css';
import Webcam from './pages/react-webcam';
import Product from './pages/Product';
import Home from './pages/Home';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";


const theme = createMuiTheme({
  overrides: {
    MuiAppBar: { // Name of the component ⚛️ / style sheet
      colorPrimary: { // Name of the rule
        backgroundImage: 'linear-gradient(to left, #82d84e, #0ead69)',
      },
    },
  },
});

class App extends Component {
  state = {}

  scanProduct = (product) => {
    this.setState({
      scannedProduct: product
    })
  }

  render() {
    const { scannedProduct } = this.state;

    return (
      <div className="App">
        <ThemeProvider theme={theme}>
          <Router>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6">
                <Link to="/">
                  Mes produits
                </Link>
              </Typography>
            </Toolbar>
          </AppBar>
              <Route path="/" exact component={Home} />
              <Route path="/scan/" render={() => <Webcam onScanProduct={this.scanProduct}/>} />
              <Route path="/product/" render={() => <Product product={scannedProduct}/>} />
          </Router>
        </ThemeProvider>
      </div>
    );
  }
}

export default App;

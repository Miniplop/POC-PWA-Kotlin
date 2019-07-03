import React, { Component } from 'react';
import emptyIcon from '../assets/ic-empty-saved.svg'
import OpenFoodFactsMpp from 'OpenFoodFactsMpp';
import { Link } from "react-router-dom";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import './Home.css'

class Home extends Component {

  renderEmptyList() {
    return(
      <div className="EmptyList">
        <img src={emptyIcon} alt={"emptyIcon"}/>
        <Link to="/scan/">
          <button className="ScanButton">
            <p className={"ScanButtonText"}>
              SCANNER UN PRODUIT
            </p>
          </button>
        </Link>
      </div>
    )
  }

  renderList(products) {
    debugger
    return(
      <div className="ProductListContainer">
        {products.map(product =>
            <Card key={product.barcode}>
              <CardActionArea>
                <img
                  src={product.picture}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {product.brands.toArray().join(' ')}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
        )}
      </div>
    )
  }

  render() {
    const appController = OpenFoodFactsMpp.com.meetup.kotlin.paris.openfoodfacts.getApplicationController();
    const productList = appController.getProductList();
    return (
      <div className="App">
        { productList.toArray && productList.toArray().length > 0 ?
          this.renderList(productList.toArray()) :
          this.renderEmptyList()
        }
      </div>
    );
  }
}

export default Home;

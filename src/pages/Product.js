import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import NutriScoreIcon from '../assets/nutriscore.jpg';
import './Product.css'

class Product extends Component {
  render() {
    const { product } = this.props;
    return (
      <div className="ProductContainer">
        {!product ? <Redirect to={"/"}/> :
          <>
            <img className="ProductImage" src={product.picture} alt="product" />
            <div className="ProductContentContainer">
              <div className="ProductContentTitlesOuterContainer">
                <div className="ProductContentTitlesInnerContainer">
                  {product.name && <p className="ProductName">{product.name}</p>}
                  {product.brands && <p className="Brand">{product.brands.toArray().join(' ')}</p>}
                </div>
                <img className="NutriScoreImage" src={NutriScoreIcon} alt="product quality" />
              </div>
              {product.barcode && <p className="ProductPropertyContainer"><span className="ProductProperty">Code barre :</span> {product.barcode}</p>}
              {product.quantity && <p className="ProductPropertyContainer"><span className="ProductProperty">Quantité :</span> {product.quantity}</p>}
              {product.ingredients && <p className="ProductPropertyContainer"><span className="ProductProperty">Ingrédients :</span> {product.ingredients.toArray().join(', ')}</p>}
              {product.allergens && <p className="ProductPropertyContainer"><span className="ProductProperty">Allergènes :</span> {product.allergens.toArray().join(', ')}</p>}
            </div>
          </>
        }
      </div>
    );
  }
}

export default Product;

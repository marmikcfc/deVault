import React, {Component} from 'react';
import Gallery, { PhotoProps } from 'react-photo-gallery'

class Photos extends Component{
  constructor(props){             
    super(props);                 
    this.state = { currentImage: 0 }; 
  }

  shouldComponentUpdate(nextProps) {
    return this.props.photos.length !== nextProps.photos.length;
  }

  render(){
    return(
      <div>
        <Gallery photos={this.props.photos} />
      </div>
    )
  }
}
export default Photos;
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AWS from 'aws-sdk';
import './S3Uploader.css';
import {Typography, Button} from '@material-ui/core'
import { message } from "antd";

class S3Uploader extends Component {
  state = {
    loader: false,
    file: '',
    message: '',
    successMessage:'',
    errorMessage:''
  };

  componentDidMount() {
    AWS.config.update({
      region: this.props.bucketRegion,
      credentials: new AWS.Credentials("AKIAW3UI7RFN6O37YPPV", "4143Onwg0sXL6C3swxABKCWvWxsmsIIr0440N5nf") ,
    });
  }

  statusMessage = (msg) => {
    message.success(msg)
  }



  onChangeFile = () => {
    this.setState({ loader: true, file: '' });
    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: { Bucket: this.props.albumBucketName },
    });
    const { files } = document.getElementById('photoupload');
    if (!files.length) {

      return this.statusMessage('Please choose a file to upload first.');
    }
    const file = files[0];
    const fileName = file.name;
   
    
    s3.upload(
      {
        Key: fileName,
        Body: file,
        ACL: 'public-read',
      },
      (err, data) => {
        if (err) {
          this.setState({errorMessage:"something went wrong while uploading"}, ()=>{

            this.props.handleFile(this.state.file,this.state.successMessage,this.state.errorMessage);
          })
        } else {
          this.setState({ loader: false, file: data.Location,successMessage:"file uploaded successfully" }, ()=>{

            this.props.handleFile(data.Location,this.state.successMessage,this.state.errorMessage);

          });
          
        }
      }
    );
  };

  render() {
    const { file, message, loader } = this.state;
    const { buttonName } = this.props;
    return (
      <div className="S3Uploader" style={{width:"fit-content"}}>
        <div className="S3Uploader-content">
          <div className="S3Uploader-service">
            <Button variant="contained" color="primary" component="span" >{buttonName}</Button>
            <input
              type="file"
              name="myfile"
              id="photoupload"
              onChange={this.onChangeFile}
            />
          </div>
          <div className="S3Uploader-image">
            {loader ? <div className="Loader" /> : null}
            {file ?( <Typography variant="body2"> successfully uploaded </Typography>) : null}
          </div>
        </div>
        <div className="S3Uploader-message">
          <span>{message > 0 ? message : null}</span>
        </div>
      </div>
    );
  }
}

S3Uploader.defaultProps = {
  buttonName: 'Upload File',
  bucketRegion: 'ap-south-1',
};

S3Uploader.propTypes = {
  buttonName: PropTypes.string,
  bucketRegion: PropTypes.string,
  albumBucketName: PropTypes.string.isRequired,
  handleFile: PropTypes.func.isRequired,
};

export default S3Uploader;

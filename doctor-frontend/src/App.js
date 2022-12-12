import "./App.css";
import React from "react";
import axios from 'axios';
import { InfinitySpin } from "react-loader-spinner";

class App extends React.Component {
  state = {
    file: null,
    base64URL: "",
    ocrRunning: false,
    ocrEnabled: true,
    ocr: [],
    meds: [],
    neverRan: true,
    option: "Others",
  };

  getBase64 = file => {
    return new Promise(resolve => {
      let fileInfo;
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();

      // Convert the file to base64 text
      reader.readAsDataURL(file);

      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object
        console.log("Called", reader);
        baseURL = reader.result;
        console.log(baseURL);
        resolve(baseURL);
      };
      console.log(fileInfo);
    });
  };

  handleFileInputChange = e => {
    
    console.log(e.target.files[0]);
    let { file } = this.state;

    file = e.target.files[0];

    this.getBase64(file)
      .then(result => {
        file["base64"] = result;
        console.log("File Is", file);
        this.setState({
          base64URL: result,
          file
        });
      })
      .catch(err => {
        console.log(err);
      });

    this.setState({
      file: e.target.files[0]
    });
  };

  handleFileUpload = () => {
    this.setState({ denoising: true, neverRan: false })
    const data = {
      base64: this.state.base64URL
    }
    axios.post('http://127.0.0.1:5000/setimg', data).then(res => {
      console.log(res)
      this.handleOCR()
    })
    
  }

  handleOCR = () => {
    this.setState({ocrRunning : true})
    this.setState({ ocr: '' })
    let type = this.state.option;
    axios.get('http://127.0.0.1:5000/ocr'+'?type='+type).then(res => res.data).then(data => {
      console.log(data)
      this.setState({ ocr: data[0], meds:data[1], ocrRunning: false})
    })
  }

  handleRadio = () => {
    this.setState({'ocrEnabled' : !this.state.ocrEnabled})
  }


  render() {
    return (
      <div className="App font-light flex flex-col items-center">
        <div className="app-header mt-20 text-3xl">Doctor's Prescription Recognition System</div>
        <div className="main-container w-[90%] flex justify-center gap-[200px] mt-10">
        <div className={`input-container w-[40%] ${!this.state.ocrEnabled && 'opacity-0'} overflow-y-scroll h-[300px] mt-20 flex flex-col items-center p-5 ${this.state.ocr.length === 0 ? '' : 'shadow-md'}`}>
          {this.state.ocr.length !== 0 ? <div className="text-md mb-5">Detected Text</div> : <></>}
            {this.state.ocrRunning && <InfinitySpin color="red" />}
            {this.state.ocr.length !== 0 ? <div className="text-2xl">{this.state.ocr.map(ocr => <div className="ocr-name">{ocr.toLowerCase()}</div>)}</div> : <></>}
          </div>
          <div className="input-container w-[40%] h-min-[500px] mt-20 flex flex-col justify-center items-center">
            <div className="options-container">
              <select name="options" id="options" onChange={(e) => {this.setState({option: e.target.value})}}>
                <option value="Others">General</option>
                <option value="Heart">Heart</option>
                <option value="Cancer">Cancer</option>
                <option value="Skin">Skin</option>
                <option value="Kidney">Kidney</option>
              </select>
            </div>
            <div className="og-img-container w-[300px] mt-5">
              {this.state.base64URL && <img src={this.state.base64URL} alt='Original Image' className="shadow-xl" />}
            </div>
            <>
              <br />
              <input className="w-[96px] hidden" type="file" name="Image" id="img" onChange={this.handleFileInputChange} />
              <label for="img" className="border bg-black text-white px-3 py-1 shadow-md hover:bg-red-300 transition hover:text-black cursor-pointer">Upload Prescription</label>
            </>
            <br />
              <input type="checkbox" className="hidden" value='OCR' name='OCR' id="ocr" onChange={e => this.handleRadio(e)} />
              <label className={`ml-2 select-none shadow-xl px-3 py-1 bg-red-300 ${!this.state.ocrEnabled && 'bg-green-300'} cursor-pointer my-5 transition`} htmlFor='ocr'>{this.state.ocrEnabled === true ? 'Hide' : 'Show'} Text</label>
            <div className={`submit-btn select-none bg-blue-300 hover:bg-green-300 px-3 py-1 cursor-pointer transition mt-5`} onClick={this.handleFileUpload}>
              {this.state.ocrRunning === true ? 'Running' : 'Run'}
            </div>
          </div>
          {<div className={`input-container w-[40%] overflow-y-scroll h-[300px] mt-20 flex flex-col items-center p-5 ${this.state.ocr.length === 0 ? '' : 'shadow-md'}`}>
          {this.state.ocr.length !== 0 ? this.state.meds.length !== 0 ? <div className="text-md mb-5">Medicines Found</div> : <>Medicines Not Found</> : ''}
            {this.state.ocrRunning && <InfinitySpin color="red" />}
            {!this.state.ocrRunning && this.state.meds.length !== 0 ? <div className="text-2xl">{this.state.meds.map((med, index) => <div className="med-name">{index+1}. {med.toLowerCase()}</div>)}</div> : <></>}
          </div>}
        </div>
      </div>
    );
  }
}

export default App;

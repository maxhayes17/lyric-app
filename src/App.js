import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// 
let fakeServerData = {
  user: {
    name: "Max",
    playlists: [
      {
        name: "playlist 1",
        songs: ["song 1", "song 2", "song 3"],

      },
      {
        name: "playlist 2",
        songs: ["song 4", "song 5", "song 6"]
      }
    ]
  }
};

class PlaylistCounter extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.playlists.length} playlists</h2>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {serverData: {}}
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({serverData: fakeServerData});
    }, 1000);
  }
  render() {
    return (
      <div className="App">
        {this.state.serverData.user ?
        <div>
          <h1>lyricify</h1>
          <PlaylistCounter playlists={this.state.serverData.user.playlists}/>
        </div> : <h1>Loading...</h1>
        }
      </div>
    );
  }
}



export default App;

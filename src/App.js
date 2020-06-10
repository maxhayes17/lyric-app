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
        name: "plablist 2",
        songs: ["song 4", "song 5", "song 6"]
      }
    ]
  }
};
class Playlist extends Component {
  render() {
    return (
      <div>
        <img></img>
        <h3>{this.props.playlist.name}</h3>
      </div>
    );
  }
}

class PlaylistCounter extends Component {
  render() {
    let plCount = ""
    if ((this.props.playlists.length) == 1) {plCount = "playlist"}
    else {plCount = "playlists"}

    return (
      <div>
        <h2>{this.props.playlists.length} {plCount}</h2>
      </div>
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div>
          <input type="text" placeholder="Search Playlists" onKeyUp={event => 
            this.props.onTextChange(event.target.value)}/>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {serverData: {},
    filterString: ""
    }
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({serverData: fakeServerData});
    }, 1000);
  }
  render() {
    let playlistToRender = this.state.serverData.user ? 
    this.state.serverData.user.playlists.filter(playlist =>
      playlist.name.toLowerCase().includes(
        this.state.filterString.toLowerCase())
    ) : []
    return (
      <div className="App">
        {this.state.serverData.user ? // ? = if true, run code, if else, run whatever's after :
        <div>
          <h1>lyricify</h1>

          <Filter onTextChange={text => this.setState({filterString: text})}/>

          <PlaylistCounter playlists={playlistToRender}/>

          {playlistToRender.map(playlists => 
    
          <Playlist playlist={playlists}/>)} 
        </div> : <h1>Loading...</h1>
        }
      </div>
    );
  }
}



export default App;

import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';
import { TwitterPicker } from 'react-color';

class Playlist extends Component {
  render() { 
    let playlist = this.props.playlist
    return (
      <div>
          <input type="image" src={playlist.imageUrl} className="image"/>
          <h3>{playlist.name}</h3>
        </div>

    );
  }
}
class Songs extends Component {
  render() {
    let embed = "https://open.spotify.com/embed/"
    let playlistURI = this.props.playlist.uri.replace("spotify:", "").replace(":", "/")
    let uriSrc = embed + playlistURI
    return (
      <div id="songPlayer"> 
        <iframe src={uriSrc} 
        width="400px" height="530px" frameBorder="0" 
        allowtransparency="false" allow="encrypted-media"
        style={{
          borderRadius: "5px",
          marginBottom: "17px"
        }}></iframe>
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
      <div style={{display:"inline-block", width:"185px"}}>
        <h2>{this.props.playlists.length} {plCount}</h2>
      </div>
    );
  }
}
class SpinningImage extends Component {
  render() {

    return (
      <div style={{borderRadius: "50%",
      animation: "spin 6s linear infinite"}}>
        <div style={{backgroundColor: this.props.bk,
         borderRadius:"50%", height: "90px", width:"90px", 
        position: "absolute",
        margin: "-60px 0px 0px -60px",
        top: "50%", left: "50%",
        borderStyle: "solid", borderColor:"#D0D0D0", borderWidth:"15px"}}></div>
        <img src={this.props.playlist.imageUrl}
        width="400px" height="400px" 
        style={{borderRadius: "50%",
        position: "relative",
        zIndex: "-1",
        borderStyle: "solid", borderColor:"#383838"
        }}/>

      </div>
        
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div style={{display:"inline-block", marginLeft:"15px"}}>
          <input id="filter" type="text" placeholder="Search Playlists" onKeyUp={event => 
            this.props.onTextChange(event.target.value)} 
            style={{height: "30px", paddingRight:"200px", fontSize:"15px"}}/>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
    serverData: {},
    filterString: "",
    speed: 6,
    sliceMin: 0,
    sliceMax: 1,
    background: "#404040"
    }
  }
  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token
    if (!accessToken) {
      return;
    }
    else {
          fetch('https://api.spotify.com/v1/me', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(data => this.setState({
      user: {
        name: data.display_name
      }
    }))

    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(playlistData => {
      let playlists = playlistData.items
      let trackDataPromises = playlists.map(playlist => {
        let responsePromise = fetch(playlist.tracks.href, {
          headers: {'Authorization': 'Bearer ' + accessToken}
        })
        let trackDataPromise = responsePromise
        .then(response => response.json())
        return trackDataPromise
      })
      let allTracksDataPromises = 
      Promise.all(trackDataPromises)
      let playlistsPromise = allTracksDataPromises.then(trackDatas => {
        trackDatas.forEach((trackData, i) => {
          playlists[i].trackDatas = trackData.items
          .map(item => item.track)
          .map(trackData => ({
            artists: trackData.artists.map(artist => artist.name),
            name: trackData.name,
            duration: trackData.duration_ms / 1000
          }))
      })
      return playlists
    })
    return playlistsPromise
  })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        return {
          name: item.name,
          imageUrl: item.images[0].url, 
          songs: item.trackDatas,
          uri: item.uri
          
        }
        
    })
    }))



  }
  }
  render() {
    let playlistToRender = this.state.user && this.state.playlists ? 
    this.state.playlists.filter(playlist => {
      let matchesPlaylist = playlist.name.toLowerCase().includes(
        this.state.filterString.toLowerCase())
      let matchesSong = playlist.songs.find(song => song.name.toLowerCase()
      .includes(this.state.filterString.toLowerCase()))
      let matchesArtists = playlist.songs.find(song => song.artists.toString().toLowerCase()
      .includes(this.state.filterString.toLowerCase()))
        return matchesPlaylist || matchesSong || matchesArtists
      }) 
      : []
    return (
      <div className="App" style={{backgroundColor: this.state.background}} >
        {this.state.user ? // ? = if true, run code, if else, run whatever's after :
        <div style={{marginLeft: "10%"}}> 
          <div style={{}}>
            <h1 className="title">your playlists</h1>
          </div>
          <div style={{}}>
            <PlaylistCounter playlists={playlistToRender}/>
            <Filter onTextChange={text => this.setState({filterString: text})}/>
          </div>
          <div style={{display:"flex"}}>
          <div style={{width:"200px", display:"inline-block"}}>
          {playlistToRender.slice(this.state.sliceMin,this.state.sliceMax)
          .map(playlists =>
        <div style={{display: "flex"}}>
          <div style={{display:"inline-block", paddingRight:"10px"}}>
            <Playlist playlist={playlists}/>
                <div style={{textAlign: "center", marginTop: "50px"}}> 
                  <button style={{textAlign: "center", display:"block", 
                    marginLeft:"auto", marginRight:"auto", marginTop:"20px", 
                    backgroundColor: this.state.background, color: "white", fontSize: "15px", 
                    borderRadius:"5px", padding:"10px", borderStyle:"solid", borderColor:"white"
                    }} disabled={this.state.sliceMax == playlistToRender.length}
                      onClick={()=> this.setState({sliceMax: this.state.sliceMax + 1},
                      this.setState({sliceMin: this.state.sliceMin + 1}))}
                    >Next Playlist
                    <svg class="bi bi-skip-end-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M12 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/>
                    <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                    </svg>
                  </button>
                  <button style={{textAlign: "center", display:"block", 
                    marginLeft:"auto", marginRight:"auto", marginTop:"20px", 
                    backgroundColor: this.state.background, color:"white", fontSize:"15px",
                    borderRadius:"5px", padding:"10px", borderStyle:"solid", borderColor:"white"
                    }} disabled={this.state.sliceMin == 0}
                      onClick={()=> this.setState({sliceMax: this.state.sliceMax - 1},
                      this.setState({sliceMin: this.state.sliceMin - 1}))}>
                    <svg class="bi bi-skip-start-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M4.5 3.5A.5.5 0 0 0 4 4v8a.5.5 0 0 0 1 0V4a.5.5 0 0 0-.5-.5z"/>
                    <path d="M4.903 8.697l6.364 3.692c.54.313 1.232-.066 1.232-.697V4.308c0-.63-.692-1.01-1.232-.696L4.903 7.304a.802.802 0 0 0 0 1.393z"/>
                    </svg> Last Playlist
                  </button>
                </div>
          </div>
        <div style={{display:"inline-block"}}>
          <Songs playlist={playlists}/>
        </div>
        <div style={{display:"inline-block", marginLeft:"150px"}}>
          <SpinningImage playlist={playlists} bk = {this.state.background}/>
          <div style={{marginTop:"50px"}}>
          <TwitterPicker
                    style={{backgroundColor:"#404040"}}
                    color={this.state.background}
                    onChangeComplete= {(color) => {
                      this.setState({ background: color.hex })}}
                    width = "400px"
                    colors = {['#404040',  '#000000', '#000033', '#003333', '#330033', '#330000']}
                    triangle = "hide"
                    />
          </div>
        </div>
      </div>)}

          </div>
          </div>


          

 

        </div> : <div className="center">
          <h1 className="title">CD Player</h1>
          <button onClick={()=>{
          window.location = window.location.href.includes('localhost') 
              ? 'http://localhost:8888/login' 
              : 'https://oauth-bridge-template.herokuapp.com/login' }}
        className="but">Sign in with Spotify</button></div>
        }
      </div>
    );
  }
}



export default App;

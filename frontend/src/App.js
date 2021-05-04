import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Home from './components/pages/homepage/home.js'
import Account from './components/pages/accountpage/account.js'
import ResetPass from './components/pages/resetpasspage/resetpass.js'
import NoPage from './components/pages/pagenotfound/pagenotfound'
import Navbar from './components/pages/navbar/nav.js'
import ArticlePages from './components/pages/articlepages/article.js'
import CreatePost from './components/pages/createpostpage/createpost.js'
import EditPost from './components/pages/editpostpage/editpost.js'
import './App.css';

class App extends React.Component {
  constructor(){
    super()
    this.state = {
      displaySlide:true,typeOfSearch:"search"
    }
    this.handleChangeSearchType = this.handleChangeSearchType.bind(this)
  }
  componentDidMount(){
    const display = localStorage.getItem("displayslide")
    if(display==="true"){
      this.setState({displaySlide:false})
    }else{
      this.setState({displaySlide:true})
    }
  }
  handleDisplayMode(){
    this.setState({displaySlide:!this.state.displaySlide})
  }
  handleChangeSearchType(type){
    this.setState({typeOfSearch:type})
  }

  render() {
    return (
      <BrowserRouter>
        <Navbar handleDisplayMode = {this.handleDisplayMode.bind(this)} {...this.state} handleChangeSearchType={this.handleChangeSearchType}></Navbar>
        
        <Switch>
     
          <Route path='/'  exact render={(props)=>(<Home {...props} {...this.state} handleChangeSearchType={this.handleChangeSearchType}/>)} ></Route>
          <Route path='/article'>
            <Route path='/:title' component={ArticlePages}></Route>
          </Route>
          <Route path='/account' exact component={Account}></Route>
          <Route path='/account/resetpass' exact>
              <Route path='/:token' component={ResetPass}></Route>
          </Route>
          <Route path="/createpost" exact component={CreatePost}></Route>
          <Route path="/editpost" exact component={EditPost}></Route>
          <Route path="/resetpassword" exact component={ResetPass}></Route>
          <Route path='*' exact component={NoPage}></Route>
        </Switch>
        
      </BrowserRouter>
    )
  }
}

export default App;

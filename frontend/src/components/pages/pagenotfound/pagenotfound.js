//Renders this page if a invalid route is typed in
import React from 'react'
import './pagenotfound.css'


class resetpass extends React.Component{
    componentDidMount(){
    }
    render(){
        return(
            <div className="page-container">
                
               <div className="middle-container">
                    page not found
               </div>
            </div>
        )
    }
}

export default resetpass;
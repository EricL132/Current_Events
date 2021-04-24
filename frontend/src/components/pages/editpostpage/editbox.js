import { useEffect, useState } from 'react'
import './editbox.css'

let continueInterval;
export default function Editbox(props) {
    const [formInfo, setFormInfo] = useState({
        title: "",
        author: "",
        topic: "",
        vid: "",
        backupvid:"",
        urlToImage: "",
        content: "",
        article:props.selectedItem._id
    })
    const [displayForm, setdisplayForm] = useState({

    })
    const [articleCreated, setarticleCreated] = useState(false)
    const [errorMessage,seterrorMessage] = useState("")

    useEffect(() => {
        document.getElementById("file-input").addEventListener('click', (e) => {
            e.stopPropagation();
            e.target.value = null
        })

    })
    useEffect(()=>{
        if(props.isDisplay){
            setdisplayForm(props.selectedItem)
            console.log(displayForm)
        }
        
    },[props])

    function handleFileChange(){
        const file = document.getElementById("file-input").files[0]
        const form = new FormData()
        form.append('file', file)
        setarticleCreated(true)
        seterrorMessage("Wait for image to save")
        fetch('/info/saveimage', { method: "POST", body: form }).then(async (res) => {
            const resInfo = await res.json()
            document.getElementById("post-image").value = `https://drive.google.com/uc?id=${resInfo.imagelink}`
            setFormInfo((prev)=>({...prev,urlToImage:`https://drive.google.com/uc?id=${resInfo.imagelink}`}))
            setarticleCreated(false)
            seterrorMessage("")

        })
    }
    const changeInput = (e) => {
        e.preventDefault()
        const { name, value } = e.target
        setFormInfo(prev => ({ ...prev, [name]: value }))
    
    }
    function handleEditPost(e) {
        e.preventDefault()
        if (!articleCreated) {
            setarticleCreated(true)
            const loadingSpan = document.getElementsByClassName("loading-span")[0]
            loadingSpan.innerHTML = ""
            loadingSpan.classList += " loading"
            if (!formInfo.urlToImage.includes("https://drive.google.com/uc?id=") && formInfo.urlToImage !== "") {
                 fetch(formInfo.urlToImage).then(async (res) => {
                    const blob = await res.blob()
                    const file = new File([blob], "image.png", { type: blob.type })
                    let form = new FormData();
                    form.append("file", file)
                    await fetch('/info/saveimage', { method: "POST", body: form }).then(async (res) => {
                        const resInfo = await res.json()
                        document.getElementById("post-image").value = `https://drive.google.com/uc?id=${resInfo.imagelink}`
                        setFormInfo((prev)=>({...prev,urlToImage:`https://drive.google.com/uc?id=${resInfo.imagelink}`}))

                    })
                })
            }
            continueInterval = setInterval(async () => {
                if (formInfo.vid !== "") {
                    if (formInfo.urlToImage.includes("https://drive.google.com/uc?id=") || formInfo.urlToImage === "") {
                        clearInterval(continueInterval)
                        const link = formInfo.vid.split('=')[1]
                        const res = await fetch('/info/createbackupvid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ link: link }) })
                        const reslink = await res.json()

                        setFormInfo((prev)=>({...prev,backupvid:'https://drive.google.com/file/d/' + reslink.link + '/preview'}))
                        await fetch('/info/editpost', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                formInfo
                            })
                        }).then(async (res) => {
                            if (res.status !== 200) {
                                const erro = await res.json()
                                seterrorMessage(erro.status)
                                setarticleCreated(false)
                                const loadingSpan = document.getElementsByClassName("loading-span")[0]
                                loadingSpan.innerHTML = "Edit Article"
                                loadingSpan.classList += "loading-span"
                            } else {
                                props.props.history.push('/')
                            }
                        })

                    }
                } else {
                    clearInterval(continueInterval)
                    await fetch('/info/editpost', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                            formInfo
                        })
                    }).then(async (res) => {
                        if (res.status !== 200) {
                            const erro = await res.json()
                            seterrorMessage(erro.status)
                            setarticleCreated(false)
                            const loadingSpan = document.getElementsByClassName("loading-span")[0]
                            loadingSpan.innerHTML = "Edit Article"
                            loadingSpan.classList += "loading-span"
                        } else {
                            props.props.history.push('/')
                        }
                    })

                }


            }, 3000)
        }

    }

    function handleFileInput() {

        document.getElementById("file-input").click();

    }
    return (
        <>
            {props.isDisplay ?
                <div id="selected-item-info-container">
                    <div className="inputfield-container">
                        <input className="post-input" defaultValue={displayForm.title} readOnly></input>
                        <input className="post-input" defaultValue={displayForm.author} readOnly></input>
                        <input className="post-input" defaultValue={displayForm.topic} readOnly></input>

                        <div id="image-container">
                            <input className="post-input" defaultValue={displayForm.urlToImage} readOnly></input>
                        </div>
                        <input className="post-input" defaultValue={displayForm.vid} readOnly></input>
                        <textarea className="post-input post-info" defaultValue={displayForm.content} readOnly></textarea>
                    </div>
                </div>

                : <div id="selected-item-info-container">

                    <h4 style={{ marginTop: "2rem", color: "var(--text-color-white)", textAlign: "center" }}>Edit fields, Leave empty to keep the same </h4>
                    <form id="info-form-edit" className="inputfield-container" style={{ marginTop: "-1.5rem" }} onSubmit={handleEditPost} onChange={changeInput}>
                        <input autoComplete="off" spellCheck={false} id="post-title" name="title" className="post-input" placeholder="Title"></input>
                        <input autoComplete="off" spellCheck={false} id="post-author" name="author" className="post-input" placeholder="Author"></input>
                        <input autoComplete="off" spellCheck={false} id="post-topic" name="topic" className="post-input" placeholder="Topic"></input>

                        <div id="image-container">
                            <input autoComplete="off" spellCheck={false} id="post-image" className="post-input" placeholder="Image Link" name="urlToImage"></input>
                            <input id="file-input" type="file" accept="image/png, image/jpeg" onChange={handleFileChange}></input>
                            <div id="addImageByFile-container">
                                <button id="addfileButton" onClick={handleFileInput} type="button"><i className="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <input autoComplete="off" spellCheck={false} id="post-video" name="video" className="post-input" placeholder="Video Link"></input>
                        <textarea autoComplete="off" spellCheck={false} className="post-input post-info" name="content" style={{ height: "22rem" }} placeholder="Information"></textarea>
                        <span id="error-Message"style={{bottom:"1.4rem"}}>{errorMessage}</span>
                        <button className="submitcreate" style={{ bottom: "1rem" }}><span className="loading-span">Edit</span></button>
                    </form>


                </div>}

        </>
    )
}
import { useEffect, useState } from 'react'
import './editbox.css'

let continueInterval;
export default function Editbox(props) {
    const [formInfo, setFormInfo] = useState({
        title: "",
        topic: "",
        vid: "",
        backupvid: "",
        urlToImage: "",
        content: "",
        article: props.selectedItem._id
    })
    const [displayForm, setdisplayForm] = useState({

    })
    const [articleCreated, setarticleCreated] = useState(false)
    const [errorMessage, seterrorMessage] = useState("")

    //Listens for click button to add a image from desktop
    useEffect(() => {
        document.getElementById("file-input").addEventListener('click', (e) => {
            e.stopPropagation();
            e.target.value = null
        })

    })

    //Component used to show current article details and things to edit so displayed
    useEffect(() => {
        if (props.isDisplay) {
            setdisplayForm(props.selectedItem)
        }

    }, [props])
    //Rerenders component when forminfo changes
    useEffect(() => {
        if (articleCreated) {
            editRequest()
        }
    }, [formInfo])


    //Handles file upload from desktop
    function handleFileChange() {
        const file = document.getElementById("file-input").files[0]
        const form = new FormData()
        form.append('file', file)
        setarticleCreated(true)
        seterrorMessage("Wait for image to save")
        fetch('/info/saveimage', { method: "POST", body: form }).then(async (res) => {
            const resInfo = await res.json()
            document.getElementById("post-image").value = `https://drive.google.com/uc?id=${resInfo.imagelink}`
            setFormInfo((prev) => ({ ...prev, urlToImage: `https://drive.google.com/uc?id=${resInfo.imagelink}` }))
            setarticleCreated(false)
            seterrorMessage("")

        })
    }

    //Changes forminfo when called (something should be edited)
    const changeInput = (e) => {
        e.preventDefault()
        const { name, value } = e.target
        setFormInfo(prev => ({ ...prev, [name]: value }))
    }


    //Sends edit request to server
    async function editRequest() {
        if (formInfo.vid !== "") {
            if (formInfo.urlToImage.includes("https://drive.google.com/uc?id=") || formInfo.urlToImage === "") {
                const res = await fetch('/info/createbackupvid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ link: formInfo.vid }) })
                if (res.ok) {
                    const reslink = await res.json()
                    setFormInfo((prev) => ({ ...prev, backupvid: 'https://drive.google.com/file/d/' + reslink.link + '/preview' }))
                }
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
    }

    //Saves image to drive if image is changed else called editRequest to edit article
    function handleEditPost(e) {
        e.preventDefault()
        if (!articleCreated) {
            setarticleCreated(true)
            const loadingSpan = document.getElementsByClassName("loading-span")[0]
            loadingSpan.innerHTML = ""
            loadingSpan.classList += " loading"
            if (!formInfo.urlToImage.includes("https://drive.google.com/uc?id=") && formInfo.urlToImage !== "") {
                fetch(`/info/saveimage?image=${formInfo.urlToImage}`, { method: "POST" }).then(async (res) => {
                    const resInfo = await res.json()
                    setFormInfo(prev => ({ ...prev, ["urlToImage"]: `https://drive.google.com/uc?id=${resInfo.imagelink}` }))
                })

            }else{
                editRequest()
            }




        }

    }

    //Function used for file upload from desktop
    function handleFileInput() {

        document.getElementById("file-input").click();

    }
    //Called when delete article is clicked
    function handleDeletePost() {
        fetch("/info/deletepost", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleID: formInfo.article }) }).then(async (res) => {
            if (res.ok) return props.props.history.push("/")
            const errorMess = await res.json()
            seterrorMessage(errorMess)
        })
    }


    return (
        <>
            {props.isDisplay ?
                <div className="selected-item-infos selected-item-info-container">
                    <h1 className="create-h1">Edit Post</h1>
                    <div className="inputfield-container">
                        <input className="post-input" defaultValue={displayForm.title} readOnly></input>
                        <input className="post-input" defaultValue={displayForm.topic} readOnly></input>

                        <div id="image-container">
                            <input className="post-input" defaultValue={displayForm.urlToImage} readOnly></input>
                        </div>
                        <input className="post-input" defaultValue={displayForm.vid} readOnly></input>
                        <textarea className="post-input post-info" defaultValue={displayForm.content} readOnly></textarea>
                    </div>
                </div>

                : <div className="selected-item-info-container">
                    <h4 style={{ marginTop: "2rem", color: "var(--text-color-white)", textAlign: "center" }}>Edit fields, Leave empty to keep the same </h4>
                    <form id="info-form-edit" className="inputfield-container" style={{ marginTop: "-1.5rem" }} onSubmit={handleEditPost} onChange={changeInput}>
                        <input autoComplete="off" spellCheck={false} id="post-title" name="title" className="post-input" placeholder="Title"></input>
                        <input autoComplete="off" spellCheck={false} id="post-topic" name="topic" className="post-input" placeholder="Topic"></input>

                        <div id="image-container">
                            <input autoComplete="off" spellCheck={false} id="post-image" className="post-input" placeholder="Image Link" name="urlToImage"></input>
                            <input id="file-input" type="file" accept="image/png, image/jpeg" onChange={handleFileChange}></input>
                            <div id="addImageByFile-container">
                                <button id="addfileButton" onClick={handleFileInput} type="button"><i className="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <input autoComplete="off" spellCheck={false} id="post-video" name="vid" className="post-input"  placeholder="Youtube Link/Website Link"></input>
                        <textarea autoComplete="off" spellCheck={false} className="post-input post-info" name="content" style={{ height: "22rem" }} placeholder="Information"></textarea>
                        <span id="error-Message" style={{ bottom: "-1rem" }}>{errorMessage}</span>
                        <div id="submit-buttom-container">
                            <button className="submitcreate"><span className="loading-span">Edit</span></button>
                            <button className="submitcreate" type="button" onClick={handleDeletePost}><span >Delete</span></button>

                        </div>


                    </form>


                </div>}

        </>
    )
}
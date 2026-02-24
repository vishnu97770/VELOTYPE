function ContactBtn(props)
{
    return (
        <>
            <button style={{backgroundColor: "#323437"}} onClick={props.contact_ui_changer}><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.8l-192 158.4c-9.6 7.9-22.4 7.9-32 0L48 152.8V112h416zM48 400V194.2l176 145.2c19.2 15.8 44.8 15.8 64 0l176-145.2V400H48z"></path></svg> contact</button>
        </>
    )
}

export default ContactBtn;
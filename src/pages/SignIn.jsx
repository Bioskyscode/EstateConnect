import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from 'react-toastify';
import OAuth from '../components/OAuth';


function SignIn() {
    const [showPassword, setShowPasswoord] = useState(false)
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const {email, password} = formData
    const onChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.id]: e.target.value

    }))
    }

    const onSubmit = async (e)=>{
        e.preventDefault()
        try {
            const auth = getAuth()
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
            if (userCredential.user) {
                navigate("/")
            }
            
        } catch (error) {
            toast.error("Invalid credentials")
        }
    }
    return (
    
            <div className='pageContainer form'>
                <header>
                    <p className='pageHeader'> W<span>elcom</span>e B<span>ac</span>k!</p>
                </header>
                <form onSubmit={onSubmit}>
                    <input type="email" className='emailInput' placeholder='Email' id='email' value={email} onChange={onChange} />

                    <div className='passwordInputDiv'>
                        <input type={showPassword ? "text" : "password"} placeholder='Password' id="password" className='passwordInput' value={password} onChange={onChange} />
                        <img src={visibilityIcon} alt="show password" className='showPassword' onClick={() => setShowPasswoord(!showPassword)} />
                    </div>

                    <Link className='forgotPasswordLink' to="/forgot-password">Forgot Password ?</Link>

                    <div className='signInBar'>
                        <p className='signInText'>Sign In</p>
                        <button className="signInButton"><ArrowRightIcon fill='white' width='34px' height='34px' /></button>
                    </div>

                </form>
                <OAuth />
                <Link to="/sign-up" className="registerLink">New User ?</Link>
            </div>
        
    )
}

export default SignIn
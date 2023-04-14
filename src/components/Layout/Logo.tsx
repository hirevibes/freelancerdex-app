import { NavLink } from 'react-router-dom';

function Logo() {
  return (
    <h1 className='text-2xl text-white'>
      <NavLink to='/'>
        <img src='https://uploads-ssl.webflow.com/63d95bc6235f046b968ade6f/63e37c60156dab7db5672e6f_FREELANCERDEX.jpg' />
      </NavLink>
    </h1>
  );
}

export default Logo;

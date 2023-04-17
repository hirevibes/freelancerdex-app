interface Props {
  text: string;
  type: 'button' | 'submit';
  onClick?: () => void;
}

const GradientButton: React.FC<Props> = ({ text, type, onClick }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className='bg-gradient-to-r p-2 rounded from-gradient-start via-gradient-middle to-gradient-end text-sm w-full text-white font-bold'>
      {text}
    </button>
  );
};

export default GradientButton;

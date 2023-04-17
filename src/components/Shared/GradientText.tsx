interface Props {
  text: string;
}

const GradientText: React.FC<Props> = ({ text }) => {
  return (
    <span className='bg-gradient-to-r from-gradient-start via-gradient-middle to-gradient-end inline-block text-transparent bg-clip-text'>
      {text}
    </span>
  );
};

export default GradientText;

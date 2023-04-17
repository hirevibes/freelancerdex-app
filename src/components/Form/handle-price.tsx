// import maticIcon from '../../../public/matic.png';

export function HandlePrice({ handle }: { handle: string }) {
  const length = handle.length;
  const price = length > 4 ? 1 : 200 / Math.pow(2, handle.length - 1);
  return (
    <div className='flex flex-col text-center w-full'>
      <strong className='text-sm'>&nbsp;{price}</strong>
      <label className='text-xs'>&nbsp;MATIC</label>
    </div>
  );
}

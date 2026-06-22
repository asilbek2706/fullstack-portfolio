import './Loading.scss';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loader"></div> <h2>Loading...</h2>{' '}
      <p>Please wait while we prepare your content.</p>{' '}
    </div>
  );
};

export default Loading;

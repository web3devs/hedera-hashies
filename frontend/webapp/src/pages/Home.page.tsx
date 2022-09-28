import { Button } from 'primereact';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfoCard from '../componeont/home/InfoCard';
import './Home.scss';
export default () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="home z-1">
        <h1 className="text-6xl text-white mt-8 mb-4 font-normal">
          Proof of attendance
        </h1>
        <h1 className="text-primary font-normal mt-0 mb-4">#hashies</h1>
        <div className="text mb-4">
          Create events for your communities and prove that they were there.
        </div>
        <Button
          label="Create an Event"
          className="create-event mb-8"
          onClick={() => navigate('/add-event')}
        />
        <InfoCard />
      </div>
    </>
  );
};

import { Button, InputText } from 'primereact';
import React from 'react';
import { useParams } from 'react-router-dom';

import QRCode from 'react-qr-code';
import Card from '../componeont/Card';

import './Confirmation.scss';

export default () => {
  const params = useParams();
  return (
    <div className="flex justify-content-center align-items-center">
      <Card className="w-5 flex flex-column align-items-center">
        <div className="text-lg text-white mb-4">Event created!</div>
        <div className="check-wrapper mb-4">
          <i
            className="pi pi-check"
            style={{ fontSize: '2em', color: '#6166DC' }}
          ></i>
        </div>
        <div className="flex mb-4">
          <InputText value={params.code} />
          <Button icon="pi pi-copy" className="p-button-text" />
        </div>
        <QRCode value={params.code} size={200} level="Q" />
      </Card>
    </div>
  );
};

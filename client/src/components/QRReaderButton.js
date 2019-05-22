import React, { useState } from 'react';
import QrReader from 'react-qr-reader'
import { Button, Modal } from 'antd';

function QRReaderButton({ text, onScan }) {
  const [ showQrScanner, setShowQrScanner ] = useState(false);
  return <>
    <Button type="link" style={{ paddingLeft: 0 }}
    onClick={() => setShowQrScanner(true)}
    >{text}</Button>

    <Modal
      visible={showQrScanner}
      title="QR Code Scanner"
      footer={null}
      onCancel={() => setShowQrScanner(false)}
    >
      <QrReader
        delay={300}
        onScan={(v) => {
          if (v) {
            onScan(v);
            setShowQrScanner(false);
          }
        }}
        onError={(e) => e && console.error(e)}
        style={{ width: '100%' }}
      />
    </Modal>
  </>;
}

export default QRReaderButton;

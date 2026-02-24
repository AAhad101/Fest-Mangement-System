import React, {useState, useEffect} from 'react';
import {Html5QrcodeScanner} from 'html5-qrcode';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {Camera, Type, UserCheck} from 'lucide-react';

const QRScanner = () => {
    const [manualId, setManualId] = useState('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
        });

        scanner.render(onScanSuccess, onScanFailure);

        async function onScanSuccess(decodedText) {
            // Decoded text will be "QR-TICK-XXXX" - we need the "TICK-XXXX" part
            const ticketID = decodedText.replace('QR-', '');
            await processAttendance(ticketID);
        }

        function onScanFailure(error) { /* Ignore constant scanning noise */ }

        return () => scanner.clear();
    }, []);

    const processAttendance = async (ticketID) => {
        try{
            const res = await api.put('/registrations/attendance', {ticketID});
            toast.success(res.data.message);
        } 
        catch(err){
            toast.error(err.response?.data?.message || "Invalid Code");
        }
    };

    return (
        <div className="scanner-page">
            <h2>QR Attendance Scanner</h2>
            
            {/* Live Camera / File Upload Section */}
            <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}></div>

            {/* Manual Override Section */}
            <div className="manual-override" style={{ marginTop: '30px', textAlign: 'center' }}>
                <h3><Type size={18} /> Manual Override</h3>
                <input 
                    type="text" 
                    placeholder="Enter Ticket ID (e.g. TICK-ABCD)" 
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                />
                <button onClick={() => processAttendance(manualId)}>Check In</button>
            </div>
        </div>
    );
};

export default QRScanner;
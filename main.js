const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const DATA_FILE = 'requests.json';

// Helper function to read data from JSON file
const readData = () => {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper function to write data to JSON file
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// POST /requests
app.post('/requests', (req, res) => {
    const requests = readData();
    const newRequest = { id: Date.now().toString(), ...req.body };
    requests.push(newRequest);
    writeData(requests);
    res.status(201).send(newRequest);
});

// GET /requests
app.get('/requests', (req, res) => {
    const requests = readData();
    const sortedRequests = requests.sort((a, b) => a.priority - b.priority);
    res.send(sortedRequests);
});

// GET /requests/:id
app.get('/requests/:id', (req, res) => {
    const requests = readData();
    const request = requests.find(r => r.id === req.params.id);
    if (!request) return res.status(404).send('Request not found.');
    res.send(request);
});

// PUT /requests/:id
app.put('/requests/:id', (req, res) => {
    const requests = readData();
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).send('Request not found.');

    const updatedRequest = { ...requests[index], ...req.body };
    requests[index] = updatedRequest;
    writeData(requests);
    res.send(updatedRequest);
});

// DELETE /requests/:id
app.delete('/requests/:id', (req, res) => {
    let requests = readData();
    requests = requests.filter(r => r.id !== req.params.id);
    writeData(requests);
    res.send({ message: 'Request deleted.' });
});

// POST /requests/:id/complete
app.post('/requests/:id/complete', (req, res) => {
    const requests = readData();
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).send('Request not found.');

    requests[index].status = 'completed';
    writeData(requests);
    res.send(requests[index]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

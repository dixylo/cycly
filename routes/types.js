const { Type, validate } = require('../models/type');
const express = require('express');
const router = express.Router();

// const types = [
//   { id: 1, name: 'BMX', desc: 'BMX (bicycle motocross) bikes are designed for stunts, tricks, and racing on dirt BMX tracks.' },
//   { id: 2, name: 'Electric', desc: 'An electric bicycle is a bicycle with an integrated electric motor for propulsion.' },
//   { id: 3, name: 'Kids', desc: 'Kids bicycles are designed for kids with reduced size.' },
//   { id: 4, name: 'Moutain', desc: 'Mountain bicycles (a.k.a. All Terrain Bicycle) are designed for off-road cycling.' },
//   { id: 5, name: 'Road', desc: 'Road bicycles are designed for traveling at speed on paved roads.' },
//   { id: 6, name: 'Touring', desc: 'A touring bicycle is a bicycle designed or modified to handle bicycle touring.' },
//   { id: 7, name: 'Utility', desc: 'Utility bicycles are designed for commuting, shopping and running errands.' },
//   { id: 8, name: 'Unicycle', desc: 'A unicycle is a vehicle that touches the ground with only one wheel.' },
//   { id: 9, name: 'Tandem', desc: 'A tandem or twin has two or more riders behind each other' },
// ];


router.get('/', async (req, res) => {
  const types = await Type.find().sort('name').select({ name: 1, desc: 1 });
  res.send(types);
});

router.get('/:id', async (req, res) => {
  const type = await Type.findById(req.params.id);

  if (!type) return res.status(404).send('Type with the given ID not found.');

  res.send(type);
});

router.post('/', async (req, res) => {
  const { value: { name, desc }, error } = validate(req.body);
  if (error) return res.status(400).send('Type Name or Description Invalid.');

  let type = new Type({
    name,
    desc
  });
  try {
    type = await type.save();
    res.send(type);
  } catch(ex) {
    console.log(ex.message);
  }
});

router.put('/:id', async (req, res) => {
  const { value: { name, desc }, error } = validate(req.body);
  if (error) return res.status(400).send('Type Name or Description Invalid.');

  const type = await Type.findByIdAndUpdate(req.params.id, { name, desc }, { new: true });
  if (!type) return res.status(404).send('Type with the given ID not found.');

  res.send(type);
});

router.delete('/:id', async (req, res) => {
  const type = await Type.findByIdAndDelete(req.params.id);
  if (!type) return res.status(404).send('Type with the given ID not found.');

  res.send(type);
});

module.exports = router;

// async function createType () {
//   const types = [
//     { name: 'BMX', desc: 'BMX (bicycle motocross) bikes are designed for stunts, tricks, and racing on dirt BMX tracks.' },
//     { name: 'Electric', desc: 'An electric bicycle is a bicycle with an integrated electric motor for propulsion.' },
//     { name: 'Kids', desc: 'Kids bicycles are designed for kids with reduced size.' },
//     { name: 'Moutain', desc: 'Mountain bicycles (a.k.a. All Terrain Bicycle) are designed for off-road cycling.' },
//     { name: 'Road', desc: 'Road bicycles are designed for traveling at speed on paved roads.' },
//     { name: 'Tandem', desc: 'A tandem or twin has two or more riders behind each other' },
//     { name: 'Touring', desc: 'A touring bicycle is a bicycle designed or modified to handle bicycle touring.' },
//     { name: 'Unicycle', desc: 'A unicycle is a vehicle that touches the ground with only one wheel.' },
//     { name: 'Utility', desc: 'Utility bicycles are designed for commuting, shopping and running errands.' },
//   ];

//   types.forEach(async (type) => {
//     const newType = new Type(type);
  
//     try {
//       const result = await newType.save();
//       console.log('New Type Created Successfully.', result);
//     } catch (ex) {
//       console.log(ex.message);
//     }
//   });
// }

// createType();
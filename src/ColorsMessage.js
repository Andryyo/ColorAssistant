import protobuf from 'protobufjs/light';

const Root = protobuf.Root;
const Type = protobuf.Type;
const Field = protobuf.Field;

export const LabMessage = new Type('LabMessage')
  .add(new Field('mode', 1, 'string'))
  .add(new Field('l', 2, 'float'))
  .add(new Field('a', 3, 'float'))
  .add(new Field('b', 4, 'float'));

export const ColorMessage = new Type('ColorMessage')
  .add(new Field('collection', 8, 'string'))
  .add(new Field('name', 9, 'string'))
  .add(new Field('hex', 10, 'string'))
  .add(new Field('color', 11, 'LabMessage'))
  .add(new Field('H', 12, 'int32'))
  .add(new Field('S', 13, 'int32'))
  .add(new Field('V', 14, 'int32'))
  .add(new Field('owned', 15, 'bool'))
  .add(new Field('bases', 16, 'int32', 'repeated'))
  .add(new Field('ratio', 18, 'float'));

export const ColorsMessage = new Type('ColorsMessage').add(
  new Field('colors', 17, 'ColorMessage', 'repeated')
);

export const root = new Root()
  .define('ColorAssistant')
  .add(LabMessage)
  .add(ColorMessage)
  .add(ColorsMessage);

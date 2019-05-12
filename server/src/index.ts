import logger from './logger';
import RadixAPI from './radixApi';
import key from '../key.json';


const radix = new RadixAPI(process.env.APP_ID as string, '../cache.db')
post();

async function post() {
  await radix.initialize(key, process.env.KEY_PASSWORD as string);
  // const id = 'Vsb-bNkC3new6br6AAfRc';

  await setTimeout(async () => {
    const id = await radix.submitData({ data: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut elementum lectus. Sed aliquam orci magna, ornare tristique elit luctus ut. Vestibulum quis dignissim libero. Duis nisi orci, ornare vestibulum varius non, pellentesque id turpis. Praesent id sodales ligula, ut tempus leo. Sed cursus ipsum in sem porta aliquet. Nunc at justo risus. Maecenas ullamcorper magna dapibus ornare dapibus. Quisque scelerisque eros ut egestas convallis. Vivamus congue fermentum ultrices. In pulvinar vel velit vel scelerisque.

    Pellentesque ut rhoncus libero. Nullam pretium faucibus libero at tincidunt. In accumsan ac orci rhoncus elementum. Phasellus eget turpis ac purus fermentum convallis eget nec lectus. Vestibulum egestas volutpat libero gravida viverra. Vivamus fermentum dolor ac dolor vulputate, et molestie tellus finibus. Fusce viverra eu ipsum vel faucibus. Etiam congue, massa posuere laoreet congue, metus dolor vehicula quam, ut cursus ante nisi non orci.
    
    Nullam in hendrerit metus. Aenean gravida, ipsum luctus suscipit elementum, sem magna ultrices nibh, vitae dapibus lacus justo a leo. Nam at feugiat sapien. Sed pellentesque eget enim sed molestie. Sed eu urna quis lacus dapibus efficitur. Morbi euismod ligula eget metus dapibus aliquet. Praesent sit amet quam ultricies nibh egestas efficitur sollicitudin non tellus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    
    Vivamus imperdiet semper sapien a ornare. Nunc consequat laoreet turpis, ut ultrices nisi imperdiet vitae. Aliquam at felis ut libero posuere euismod eget sit amet nibh. Maecenas nec tortor lobortis felis dignissim aliquet. Ut interdum eget orci nec mattis. Donec blandit mi vehicula leo sodales, vel aliquam orci vestibulum. Curabitur at sem malesuada, dapibus ipsum eu, condimentum quam. Nam malesuada placerat risus, aliquam ornare metus pretium ac. Morbi imperdiet hendrerit tempor. Quisque a velit sit amet urna condimentum tristique non non mauris. Integer rutrum molestie urna, sit amet ultrices nibh tincidunt non. Aliquam egestas non mauris eu rutrum. Pellentesque turpis arcu, tempus et feugiat vitae, semper sit amet tortor. Praesent non mollis mi. Morbi non mauris lorem.
    
    Quisque quis finibus ipsum. Curabitur vehicula rutrum dolor. Mauris porttitor turpis ultricies mi imperdiet, sed condimentum lorem molestie. Curabitur aliquam nunc vitae felis faucibus, sed sodales est elementum. Vestibulum at maximus nisl. Pellentesque libero lectus, ultricies et semper non, fermentum consequat nisl. Phasellus bibendum tellus arcu, et luctus augue mattis in. Donec eget scelerisque leo.
    
    ` });
    logger.info('Stored data: ' + id);
    logger.info('data:', radix.getData(id))
  }, 5000)
  
}
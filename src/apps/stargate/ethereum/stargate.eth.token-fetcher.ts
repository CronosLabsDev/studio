import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { ZERO_ADDRESS } from '~app-toolkit/constants/address';
import { Register } from '~app-toolkit/decorators';
import { AppTokenTemplatePositionFetcher } from '~position/template/app-token.template.position-fetcher';
import { GetDataPropsParams } from '~position/template/app-token.template.types';
import { Network } from '~types/network.interface';

import { StargateContractFactory, StargateEth } from '../contracts';
import { STARGATE_DEFINITION } from '../stargate.definition';

const appId = STARGATE_DEFINITION.id;
const groupId = STARGATE_DEFINITION.groups.eth.id;
const network = Network.ETHEREUM_MAINNET;

type StargateEthAppTokenDataProps = {
  liquidity: number;
  reserve: number;
};

@Register.TokenPositionFetcher({ appId, groupId, network })
export class EthereumStargateEthTokenFetcher extends AppTokenTemplatePositionFetcher<
  StargateEth,
  StargateEthAppTokenDataProps
> {
  appId = appId;
  groupId = groupId;
  network = network;
  groupLabel = 'Wrapped';

  constructor(
    @Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) protected readonly contractFactory: StargateContractFactory,
  ) {
    super(appToolkit);
  }

  getContract(address: string): StargateEth {
    return this.contractFactory.stargateEth({ address, network: this.network });
  }

  getAddresses() {
    return ['0x72e2f4830b9e45d52f80ac08cb2bec0fef72ed9c'];
  }

  async getUnderlyingTokenAddresses() {
    return [ZERO_ADDRESS];
  }

  async getDataProps({
    appToken,
  }: GetDataPropsParams<StargateEth, StargateEthAppTokenDataProps>): Promise<StargateEthAppTokenDataProps> {
    const reserve = appToken.supply; // 1:1
    const liquidity = appToken.supply * appToken.price;
    return { reserve, liquidity };
  }
}

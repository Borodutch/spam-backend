import { Controller, Get } from 'amala'

@Controller('/')
export default class RootController {
  @Get('/')
  async root() {
    return 'nothing to see here, move along'
  }
}

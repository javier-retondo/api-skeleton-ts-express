import { Router } from 'express';

export class BaseRouter<T, U, N> {
   public router: Router;
   public controller: T;
   public middleware: U;
   public routesNames: N;
   constructor(TController: new () => T, UMiddleware: new () => U, routesNames: N) {
      this.routesNames = routesNames;
      this.router = Router();
      this.controller = new TController();
      this.middleware = new UMiddleware();
      this.routes();
   }
   routes() {}
}

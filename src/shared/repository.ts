export interface Repository<T> {
  
findAll(): T[] | undefined;
findOne (item: {raza:string}): T | undefined;
add (item:T) : T | undefined;
update (item: T): T | undefined;
delete (item: { raza:string }): T | undefined;

}
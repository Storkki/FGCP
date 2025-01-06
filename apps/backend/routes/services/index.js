"use strict";

let SERVICES = [
  {
    id: 1,
    userId: 1,
    name: "Service 1",
    duration: 60,
    cost: 20.0,
    currencyId: 1,
    isDeleted: false,
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    name: "Service 2",
    duration: 30,
    cost: 70.0,
    currencyId: 1,
    isDeleted: false,
    updatedAt: new Date(),
    createdAt: new Date(),
  },
];

function getNextId() {
  return SERVICES.length ? Math.max(...SERVICES.map((s) => s.id)) + 1 : 1;
}

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    try {
      const activeServices = SERVICES.filter((s) => !s.isDeleted);

      reply.code(200).send({
        code: 200,
        message: "OK",
        data: activeServices,
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        code: 500,
        message: "Internal Server Error",
        data: null,
      });
    }
  });

  // GET SERVICE BY ID
  fastify.get("/:id", async function (request, reply) {
    try {
      const { id } = request.params;
      const service = SERVICES.find((s) => s.id === parseInt(id, 10));

      if (!service || service.isDeleted) {
        return reply.code(404).send({
          code: 404,
          message: "Service not found",
          data: null,
        });
      }

      reply.code(200).send({
        code: 200,
        message: "OK",
        data: service,
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        code: 500,
        message: "Internal Server Error",
        data: null,
      });
    }
  });

  fastify.post("/", async function (request, reply) {
    try {
      const { userId, name, duration, cost, currencyId } = request.body;

      // Validate required fields (simplified example)
      if (!name || !duration || !cost) {
        return reply.code(400).send({
          code: 400,
          message: "Missing required fields (name, duration, cost)",
          data: null,
        });
      }

      const newService = {
        id: getNextId(),
        userId: userId || 1,
        name,
        duration,
        cost,
        currencyId: currencyId || 1,
        isDeleted: false,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      SERVICES.push(newService);

      reply.code(201).send({
        code: 201,
        message: "Service created successfully",
        data: newService,
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        code: 500,
        message: "Internal Server Error",
        data: null,
      });
    }
  });

  // UPDATE SERVICE (PUT)
  fastify.put("/:id", async function (request, reply) {
    try {
      const { id } = request.params;
      const serviceIndex = SERVICES.findIndex((s) => s.id === parseInt(id, 10));

      if (serviceIndex === -1 || SERVICES[serviceIndex].isDeleted) {
        return reply.code(404).send({
          code: 404,
          message: "Service not found",
          data: null,
        });
      }

      const { userId, name, duration, cost, currencyId } = request.body;
      SERVICES[serviceIndex] = {
        ...SERVICES[serviceIndex],
        userId: userId ?? SERVICES[serviceIndex].userId,
        name: name ?? SERVICES[serviceIndex].name,
        duration: duration ?? SERVICES[serviceIndex].duration,
        cost: cost ?? SERVICES[serviceIndex].cost,
        currencyId: currencyId ?? SERVICES[serviceIndex].currencyId,
        updatedAt: new Date(),
      };

      reply.code(200).send({
        code: 200,
        message: "Service updated successfully",
        data: SERVICES[serviceIndex],
      });
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        code: 500,
        message: "Internal Server Error",
        data: null,
      });
    }
  });

  // DELETE SERVICE (Soft Delete)
  fastify.delete("/:id", async function (request, reply) {
    try {
      const { id } = request.params;
      const serviceIndex = SERVICES.findIndex((s) => s.id === parseInt(id, 10));

      if (serviceIndex === -1 || SERVICES[serviceIndex].isDeleted) {
        return reply.code(404).send({
          code: 404,
          message: "Service not found",
          data: null,
        });
      }

      // Soft delete by setting isDeleted to true
      SERVICES[serviceIndex].isDeleted = true;
      SERVICES[serviceIndex].updatedAt = new Date();

      // 204 No Content is typical for deletes, but we can also return 200 + data
      reply.code(204).send();
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({
        code: 500,
        message: "Internal Server Error",
        data: null,
      });
    }
  });
};

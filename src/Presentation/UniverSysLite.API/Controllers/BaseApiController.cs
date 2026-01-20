using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UniverSysLite.API.Controllers;

/// <summary>
/// Base API controller providing common functionality for all API controllers.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private ISender? _mediator;

    /// <summary>
    /// Gets the MediatR sender instance.
    /// </summary>
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();
}
